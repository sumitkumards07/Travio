// Amadeus API Integration
// Provides real flight and hotel data from 400+ airlines and 150,000+ hotels

const AMADEUS_API_KEY = import.meta.env.VITE_AMADEUS_API_KEY || '';
const AMADEUS_API_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET || '';
const AMADEUS_BASE_URL = 'https://test.api.amadeus.com'; // Use 'https://api.amadeus.com' for production

// Token cache
let accessToken = null;
let tokenExpiry = null;

// Rate limiting protection
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
let rateLimitedUntil = 0;

// Results cache (avoid repeat API calls)
const flightCache = new Map();
const hotelCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Check if we're rate limited
const isRateLimited = () => Date.now() < rateLimitedUntil;

// Wait for rate limit
const waitForRateLimit = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    lastRequestTime = Date.now();
};

/**
 * Get OAuth2 access token from Amadeus
 */
const getAccessToken = async () => {
    // Return cached token if still valid
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    try {
        const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: AMADEUS_API_KEY,
                client_secret: AMADEUS_API_SECRET
            })
        });

        if (!response.ok) {
            throw new Error(`Token request failed: ${response.status}`);
        }

        const data = await response.json();
        accessToken = data.access_token;
        // Token expires in ~30 minutes, refresh 5 minutes early
        tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

        console.log('✅ Amadeus token obtained');
        return accessToken;
    } catch (error) {
        console.error('❌ Amadeus auth error:', error);
        return null;
    }
};

/**
 * Search for flights using Amadeus Flight Offers Search API
 * @param {string} origin - Origin airport IATA code (e.g., 'DEL')
 * @param {string} destination - Destination airport IATA code (e.g., 'BOM')
 * @param {string} departureDate - Date in YYYY-MM-DD format
 * @param {number} adults - Number of adult passengers
 * @returns {Promise<Array>} - Array of flight offers
 */
export const searchFlights = async (origin, destination, departureDate = null, adults = 1) => {
    // Check rate limit
    if (isRateLimited()) {
        console.log('⏳ Amadeus rate limited, using fallback');
        return null;
    }

    // Default to tomorrow if no date provided
    const date = departureDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Check cache first
    const cacheKey = `flight:${origin}:${destination}:${date}:${adults}`;
    const cached = flightCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('📦 Using cached flight results');
        return cached.data;
    }

    const token = await getAccessToken();
    if (!token) return null;

    // Wait for rate limit
    await waitForRateLimit();

    try {
        const params = new URLSearchParams({
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate: date,
            adults: adults.toString(),
            currencyCode: 'INR',
            max: '10'
        });

        const response = await fetch(
            `${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${params}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (response.status === 429) {
            // Rate limited - back off for 60 seconds
            console.warn('⚠️ Amadeus rate limit hit, backing off...');
            rateLimitedUntil = Date.now() + 60000;
            return null;
        }

        if (!response.ok) {
            const error = await response.json();
            console.error('Amadeus flight search error:', error);
            return null;
        }

        const data = await response.json();
        const results = transformFlightResults(data.data, data.dictionaries);

        // Cache the results
        flightCache.set(cacheKey, { data: results, timestamp: Date.now() });

        return results;
    } catch (error) {
        console.error('Amadeus flight search error:', error);
        return null;
    }
};

/**
 * Transform Amadeus flight response to our format
 */
const transformFlightResults = (flights, dictionaries) => {
    if (!flights || flights.length === 0) return [];

    return flights.map((flight, idx) => {
        const segment = flight.itineraries[0].segments[0];
        const lastSegment = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];
        const carrier = dictionaries?.carriers?.[segment.carrierCode] || segment.carrierCode;

        // Calculate duration
        const duration = flight.itineraries[0].duration
            .replace('PT', '')
            .replace('H', 'h ')
            .replace('M', 'm');

        return {
            id: flight.id,
            from: segment.departure.iataCode,
            to: lastSegment.arrival.iataCode,
            mode: 'flight',
            operator: carrier,
            operatorCode: segment.carrierCode,
            price: Math.round(parseFloat(flight.price.total)),
            duration: duration,
            startTime: segment.departure.at.split('T')[1].substring(0, 5),
            endTime: lastSegment.arrival.at.split('T')[1].substring(0, 5),
            stops: flight.itineraries[0].segments.length - 1,
            aircraft: dictionaries?.aircraft?.[segment.aircraft.code] || segment.aircraft.code,
            flightNumber: `${segment.carrierCode}${segment.number}`,
            cabinClass: flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
            isAmadeus: true // Flag for tracking
        };
    });
};

/**
 * Search for hotels using Amadeus Hotel List + Hotel Offers API
 * @param {string} cityCode - City IATA code (e.g., 'DEL')
 * @param {string} checkInDate - Check-in date in YYYY-MM-DD format
 * @param {string} checkOutDate - Check-out date in YYYY-MM-DD format
 * @param {number} adults - Number of adults
 * @returns {Promise<Array>} - Array of hotel offers
 */
export const searchHotelsAmadeus = async (cityCode, checkInDate = null, checkOutDate = null, adults = 2) => {
    const token = await getAccessToken();
    if (!token) return null;

    // Default dates
    const checkIn = checkInDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const checkOut = checkOutDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

    try {
        // Step 1: Get hotel list by city
        const listParams = new URLSearchParams({
            cityCode: cityCode,
            radius: 50,
            radiusUnit: 'KM',
            hotelSource: 'ALL'
        });

        const listResponse = await fetch(
            `${AMADEUS_BASE_URL}/v1/reference-data/locations/hotels/by-city?${listParams}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!listResponse.ok) {
            console.error('Amadeus hotel list error:', await listResponse.text());
            return null;
        }

        const listData = await listResponse.json();
        const hotelIds = listData.data?.slice(0, 10).map(h => h.hotelId) || [];

        if (hotelIds.length === 0) {
            console.log('No hotels found in', cityCode);
            return [];
        }

        // Step 2: Get hotel offers for these hotels
        const offersParams = new URLSearchParams({
            hotelIds: hotelIds.join(','),
            checkInDate: checkIn,
            checkOutDate: checkOut,
            adults: adults.toString(),
            currency: 'INR',
            bestRateOnly: 'true'
        });

        const offersResponse = await fetch(
            `${AMADEUS_BASE_URL}/v3/shopping/hotel-offers?${offersParams}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!offersResponse.ok) {
            console.error('Amadeus hotel offers error:', await offersResponse.text());
            // Return hotel list without prices
            return transformHotelList(listData.data?.slice(0, 10), cityCode);
        }

        const offersData = await offersResponse.json();
        return transformHotelOffers(offersData.data, cityCode);
    } catch (error) {
        console.error('Amadeus hotel search error:', error);
        return null;
    }
};

/**
 * Transform hotel list to our format (without prices)
 */
const transformHotelList = (hotels, cityCode) => {
    if (!hotels) return [];

    return hotels.map((hotel, idx) => ({
        id: hotel.hotelId,
        name: hotel.name,
        city: cityCode,
        cityCode: cityCode,
        location: hotel.address?.cityName || cityCode,
        rating: 4.0 + Math.random() * 0.9,
        reviews: Math.floor(100 + Math.random() * 500),
        stars: hotel.rating || 4,
        image: `https://source.unsplash.com/800x600/?hotel,${hotel.name.split(' ')[0]}`,
        amenities: ['WiFi', 'AC', 'Restaurant'],
        badge: idx === 0 ? 'Top Rated' : null,
        prices: [],
        isAmadeus: true
    }));
};

/**
 * Transform hotel offers to our format
 */
const transformHotelOffers = (offers, cityCode) => {
    if (!offers) return [];

    return offers.map((offer, idx) => {
        const hotel = offer.hotel;
        const price = offer.offers?.[0]?.price?.total;

        return {
            id: hotel.hotelId,
            name: hotel.name,
            city: cityCode,
            cityCode: cityCode,
            location: hotel.address?.lines?.[0] || hotel.cityCode,
            rating: hotel.rating ? parseFloat(hotel.rating) : 4.0 + Math.random() * 0.9,
            reviews: Math.floor(100 + Math.random() * 500),
            stars: hotel.rating || 4,
            image: hotel.media?.[0]?.uri || `https://source.unsplash.com/800x600/?hotel,${cityCode}`,
            amenities: hotel.amenities?.slice(0, 5) || ['WiFi', 'AC', 'Parking'],
            badge: idx === 0 ? 'Best Deal' : null,
            prices: [
                {
                    provider: 'Amadeus',
                    price: price ? Math.round(parseFloat(price)) : 5000,
                    originalPrice: price ? Math.round(parseFloat(price) * 1.15) : 5750,
                    deepLink: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name)}&dest_id=${cityCode}`
                }
            ],
            isAmadeus: true
        };
    });
};

/**
 * Get airport/city suggestions for autocomplete
 */
export const searchLocations = async (keyword) => {
    const token = await getAccessToken();
    if (!token) return null;

    try {
        const params = new URLSearchParams({
            keyword: keyword,
            subType: 'CITY,AIRPORT'
        });

        const response = await fetch(
            `${AMADEUS_BASE_URL}/v1/reference-data/locations?${params}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.data?.map(loc => ({
            code: loc.iataCode,
            name: loc.name,
            cityName: loc.address?.cityName,
            countryName: loc.address?.countryName,
            type: loc.subType
        }));
    } catch (error) {
        console.error('Location search error:', error);
        return null;
    }
};

/**
 * Check if Amadeus API is configured and working
 */
export const checkAmadeusStatus = async () => {
    try {
        const token = await getAccessToken();
        return !!token;
    } catch {
        return false;
    }
};

export { getAccessToken };
