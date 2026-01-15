// Hotel API Service
// Supports multiple hotel data sources with fallback to mock data

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY || '';
const BOOKING_AFFILIATE_ID = import.meta.env.VITE_BOOKING_AFFILIATE_ID || '';
const BOOKING_API_KEY = import.meta.env.VITE_BOOKING_API_KEY || '';
const TRAVELPAYOUTS_MARKER = import.meta.env.VITE_TRAVELPAYOUTS_MARKER || '';

// City to location IDs mapping
const cityLocations = {
    'DEL': { name: 'New Delhi', lat: 28.6139, lon: 77.2090, bookingId: -2106102, country: 'in' },
    'BOM': { name: 'Mumbai', lat: 19.0760, lon: 72.8777, bookingId: -2092174, country: 'in' },
    'BLR': { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, bookingId: -2090174, country: 'in' },
    'HYD': { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, bookingId: -2096560, country: 'in' },
    'GOI': { name: 'Goa', lat: 15.2993, lon: 74.1240, bookingId: -2096670, country: 'in' },
    'JAI': { name: 'Jaipur', lat: 26.9124, lon: 75.7873, bookingId: -2101080, country: 'in' },
    'MAA': { name: 'Chennai', lat: 13.0827, lon: 80.2707, bookingId: -2092910, country: 'in' },
    'CCU': { name: 'Kolkata', lat: 22.5726, lon: 88.3639, bookingId: -2092175, country: 'in' },
};

/**
 * Get check-in/check-out dates (default: tomorrow + 2 nights)
 */
const getDefaultDates = () => {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 1);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2);

    return {
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0]
    };
};

/**
 * Search hotels using Booking.com Demand API (requires affiliate approval)
 * API Docs: https://developers.booking.com/api/demand-v3/
 */
export const searchBookingDotCom = async (cityCode, checkIn, checkOut, guests = 2) => {
    if (!BOOKING_AFFILIATE_ID || !BOOKING_API_KEY) {
        console.warn('Booking.com API credentials not configured');
        return null;
    }

    const location = cityLocations[cityCode];
    if (!location) return null;

    const url = 'https://demandapi.booking.com/3.1/accommodations/search';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${btoa(`${BOOKING_AFFILIATE_ID}:${BOOKING_API_KEY}`)}`
            },
            body: JSON.stringify({
                booker: {
                    country: 'in',
                    platform: 'desktop'
                },
                checkin: checkIn,
                checkout: checkOut,
                guests: {
                    number_of_adults: guests,
                    number_of_rooms: 1
                },
                city: location.bookingId,
                rows: 10
            })
        });

        if (!response.ok) {
            throw new Error(`Booking.com API error: ${response.status}`);
        }

        const data = await response.json();
        return transformBookingResults(data, cityCode);
    } catch (error) {
        console.error('Booking.com API error:', error);
        return null;
    }
};

/**
 * Transform Booking.com API response to our format
 */
const transformBookingResults = (data, cityCode) => {
    if (!data.result) return [];

    return data.result.map((hotel, idx) => ({
        id: hotel.hotel_id || idx,
        name: hotel.hotel_name,
        city: cityCode,
        location: hotel.address || cityLocations[cityCode]?.name,
        rating: hotel.review_score ? (hotel.review_score / 2).toFixed(1) : 4.0,
        reviews: hotel.review_nr || 100,
        stars: hotel.hotel_class || 4,
        image: hotel.main_photo_url || `https://source.unsplash.com/800x600/?hotel,${cityCode}`,
        amenities: hotel.facilities?.slice(0, 5) || ['WiFi', 'AC', 'Parking'],
        badge: hotel.review_score > 8 ? 'Top Rated' : null,
        prices: [
            {
                provider: 'Booking.com',
                price: Math.round(hotel.min_total_price?.value || hotel.price || 5000),
                originalPrice: Math.round((hotel.min_total_price?.value || 5000) * 1.2),
                deepLink: `https://www.booking.com/hotel/in/${hotel.hotel_id}.html?aid=${BOOKING_AFFILIATE_ID}`
            }
        ]
    }));
};

/**
 * Search hotels using RapidAPI Hotels API (easier to get started)
 * Get API key from: https://rapidapi.com/apidojo/api/hotels4
 */
export const searchRapidAPIHotels = async (cityCode, checkIn, checkOut) => {
    if (!RAPIDAPI_KEY) {
        console.warn('RapidAPI key not configured');
        return null;
    }

    const location = cityLocations[cityCode];
    if (!location) return null;

    try {
        // First, get location ID
        const locationResponse = await fetch(
            `https://hotels4.p.rapidapi.com/locations/v3/search?q=${encodeURIComponent(location.name)}&locale=en_US`,
            {
                headers: {
                    'X-RapidAPI-Key': RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
                }
            }
        );

        const locationData = await locationResponse.json();
        const destinationId = locationData.sr?.[0]?.gaiaId;

        if (!destinationId) {
            throw new Error('Location not found');
        }

        // Then search for hotels
        const searchResponse = await fetch(
            'https://hotels4.p.rapidapi.com/properties/v2/list',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
                },
                body: JSON.stringify({
                    currency: 'INR',
                    locale: 'en_US',
                    destination: { regionId: destinationId },
                    checkInDate: {
                        day: parseInt(checkIn.split('-')[2]),
                        month: parseInt(checkIn.split('-')[1]),
                        year: parseInt(checkIn.split('-')[0])
                    },
                    checkOutDate: {
                        day: parseInt(checkOut.split('-')[2]),
                        month: parseInt(checkOut.split('-')[1]),
                        year: parseInt(checkOut.split('-')[0])
                    },
                    rooms: [{ adults: 2 }],
                    resultsSize: 10,
                    sort: 'PRICE_LOW_TO_HIGH'
                })
            }
        );

        const searchData = await searchResponse.json();
        return transformRapidAPIResults(searchData, cityCode);
    } catch (error) {
        console.error('RapidAPI Hotels error:', error);
        return null;
    }
};

/**
 * Transform RapidAPI response to our format
 */
const transformRapidAPIResults = (data, cityCode) => {
    const properties = data.data?.propertySearch?.properties || [];

    return properties.map((hotel, idx) => ({
        id: hotel.id || idx,
        name: hotel.name,
        city: cityCode,
        location: hotel.neighborhood?.name || cityLocations[cityCode]?.name,
        rating: hotel.reviews?.score ? (hotel.reviews.score / 2).toFixed(1) : 4.0,
        reviews: hotel.reviews?.total || 100,
        stars: hotel.star || 4,
        image: hotel.propertyImage?.image?.url || `https://source.unsplash.com/800x600/?hotel,${cityCode}`,
        amenities: hotel.amenities?.slice(0, 5).map(a => a.text) || ['WiFi', 'AC'],
        badge: hotel.reviews?.score > 8 ? 'Highly Rated' : null,
        prices: [
            {
                provider: 'Hotels.com',
                price: Math.round(hotel.price?.lead?.amount || 5000),
                originalPrice: Math.round(hotel.price?.strikeOut?.amount || hotel.price?.lead?.amount * 1.2),
                deepLink: `https://www.hotels.com/h${hotel.id}.Hotel-Information?marker=${TRAVELPAYOUTS_MARKER}`
            }
        ]
    }));
};

/**
 * Generate comparison prices from multiple booking sites
 * Uses affiliate deep links
 */
export const generateComparisonPrices = (hotel, cityCode) => {
    const basePrice = hotel.prices?.[0]?.price || 5000;
    const cityName = cityLocations[cityCode]?.name || 'hotel';
    const hotelName = encodeURIComponent(hotel.name);

    return [
        {
            provider: 'Booking.com',
            price: basePrice,
            originalPrice: Math.round(basePrice * 1.15),
            deepLink: `https://www.booking.com/searchresults.html?ss=${hotelName}&dest_type=city&marker=${TRAVELPAYOUTS_MARKER}`,
            logo: '🏨',
            color: '#003580'
        },
        {
            provider: 'Agoda',
            price: Math.round(basePrice * 0.95), // Usually 5% cheaper
            originalPrice: basePrice,
            deepLink: `https://www.agoda.com/search?city=${cityCode}&checkIn=${getDefaultDates().checkIn}&los=2&marker=${TRAVELPAYOUTS_MARKER}`,
            logo: '🔴',
            color: '#5392F9'
        },
        {
            provider: 'MakeMyTrip',
            price: Math.round(basePrice * 1.05),
            originalPrice: Math.round(basePrice * 1.2),
            deepLink: `https://www.makemytrip.com/hotels/hotel-listing/?city=${cityLocations[cityCode]?.name}`,
            logo: '🔵',
            color: '#F44336'
        },
        {
            provider: 'Goibibo',
            price: Math.round(basePrice * 1.02),
            originalPrice: Math.round(basePrice * 1.18),
            deepLink: `https://www.goibibo.com/hotels/hotels-in-${cityLocations[cityCode]?.name?.toLowerCase()}/`,
            logo: '🟠',
            color: '#EC5B24'
        }
    ].sort((a, b) => a.price - b.price);
};

/**
 * Main hotel search function with fallback chain
 */
export const searchHotels = async (cityCode, checkIn = null, checkOut = null) => {
    const dates = checkIn && checkOut ? { checkIn, checkOut } : getDefaultDates();

    // Try Booking.com API first
    let hotels = await searchBookingDotCom(cityCode, dates.checkIn, dates.checkOut);

    // Fallback to RapidAPI
    if (!hotels) {
        hotels = await searchRapidAPIHotels(cityCode, dates.checkIn, dates.checkOut);
    }

    // If APIs unavailable, return null (will use mock data)
    if (!hotels) {
        console.log('No hotel API available, using mock data');
        return null;
    }

    // Add comparison prices to each hotel
    return hotels.map(hotel => ({
        ...hotel,
        prices: generateComparisonPrices(hotel, cityCode)
    }));
};

/**
 * Get hotel deep link with affiliate tracking
 */
export const getHotelAffiliateLink = (provider, cityCode, hotelName = '') => {
    const city = cityLocations[cityCode]?.name || 'india';
    const hotel = encodeURIComponent(hotelName);
    const dates = getDefaultDates();

    const links = {
        'Booking.com': `https://www.booking.com/searchresults.html?ss=${hotel || city}&checkin=${dates.checkIn}&checkout=${dates.checkOut}&aid=304142`,
        'Agoda': `https://www.agoda.com/search?city=${city}&checkIn=${dates.checkIn}&los=2`,
        'MakeMyTrip': `https://www.makemytrip.com/hotels/hotel-listing/?city=${city}`,
        'Goibibo': `https://www.goibibo.com/hotels/hotels-in-${city.toLowerCase()}/`,
        'Expedia': `https://www.expedia.com/Hotel-Search?destination=${city}`,
        'TripAdvisor': `https://www.tripadvisor.com/Hotels-g${cityLocations[cityCode]?.bookingId || ''}`
    };

    return links[provider] || links['Booking.com'];
};

export { cityLocations, getDefaultDates };
