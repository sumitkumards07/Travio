// Kiwi.com Flight API Integration
// For real-time flight search (requires API key from Travelpayouts or Kiwi.com partner program)
// Docs: https://docs.kiwi.com/ (invitation only as of May 2024)

const KIWI_API_KEY = import.meta.env.VITE_KIWI_API_KEY || '';
const PARTNER_ID = import.meta.env.VITE_TRAVELPAYOUTS_MARKER || '696077';

// Base URL - using proxy to avoid CORS
const isDev = import.meta.env.DEV;
const KIWI_API_BASE = isDev ? '/api/kiwi' : 'https://api.tequila.kiwi.com';

// IATA code mapping (same as aviasalesAPI)
const CITY_TO_IATA = {
    'Delhi': 'DEL', 'New Delhi': 'DEL',
    'Mumbai': 'BOM', 'Bombay': 'BOM',
    'Bengaluru': 'BLR', 'Bangalore': 'BLR',
    'Hyderabad': 'HYD',
    'Chennai': 'MAA', 'Madras': 'MAA',
    'Kolkata': 'CCU', 'Calcutta': 'CCU',
    'Goa': 'GOI',
    'Jaipur': 'JAI',
    'Ahmedabad': 'AMD',
    'Pune': 'PNQ',
    'Kochi': 'COK', 'Cochin': 'COK',
    'Dubai': 'DXB',
    'Singapore': 'SIN',
    'Bangkok': 'BKK',
    'London': 'LHR',
    'New York': 'JFK',
    'Paris': 'CDG',
};

const getIATACode = (city) => {
    if (city.length === 3 && city === city.toUpperCase()) return city;
    return CITY_TO_IATA[city] || city.substring(0, 3).toUpperCase();
};

// Airline name mapping
const AIRLINE_NAMES = {
    '6E': 'IndiGo',
    'AI': 'Air India',
    'UK': 'Vistara',
    'SG': 'SpiceJet',
    'G8': 'Go First',
    'I5': 'AirAsia India',
    'QP': 'Akasa Air',
    'EK': 'Emirates',
    'EY': 'Etihad',
    'QR': 'Qatar Airways',
    'SQ': 'Singapore Airlines',
    'TG': 'Thai Airways',
    'FR': 'Ryanair',
    'W6': 'Wizz Air',
};

const getAirlineName = (code) => AIRLINE_NAMES[code] || code;

/**
 * Generate Kiwi.com deep link with affiliate tracking
 */
export const generateKiwiLink = (origin, destination, departDate, adults = 1) => {
    const originIATA = getIATACode(origin);
    const destIATA = getIATACode(destination);
    const depart = departDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Kiwi.com deep link format
    // https://www.kiwi.com/en/search/results/delhi-india/mumbai-india/2026-01-20
    return `https://www.kiwi.com/en/search/results/${originIATA}/${destIATA}/${depart}?adults=${adults}`;
};

/**
 * Search flights using Kiwi.com Tequila API (requires API key)
 * Returns real-time flight prices and availability
 */
export const searchKiwiFlights = async (origin, destination, departDate, returnDate = null) => {
    const originIATA = getIATACode(origin);
    const destIATA = getIATACode(destination);

    // Format date as DD/MM/YYYY for Kiwi API
    const depart = departDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const departFormatted = depart.split('-').reverse().join('/');

    console.log('🔍 Kiwi.com API search:', originIATA, '→', destIATA);

    // Check if API key is available
    if (!KIWI_API_KEY) {
        console.log('⚠️ Kiwi API key not set - using deep links only');
        return {
            success: false,
            usingRealData: false,
            flights: [],
            deepLink: generateKiwiLink(origin, destination, depart),
            error: 'API key not configured'
        };
    }

    try {
        const params = new URLSearchParams({
            fly_from: originIATA,
            fly_to: destIATA,
            date_from: departFormatted,
            date_to: departFormatted,
            curr: 'INR',
            locale: 'en',
            adults: '1',
            limit: '50',
            sort: 'price',
            vehicle_type: 'aircraft',
        });

        if (returnDate) {
            const returnFormatted = returnDate.split('-').reverse().join('/');
            params.append('return_from', returnFormatted);
            params.append('return_to', returnFormatted);
        }

        const response = await fetch(`${KIWI_API_BASE}/v2/search?${params.toString()}`, {
            headers: {
                'apikey': KIWI_API_KEY,
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Kiwi API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            console.log(`✅ Kiwi.com: Found ${data.data.length} flights`);

            return {
                success: true,
                usingRealData: true,
                currency: 'INR',
                flights: data.data.map(flight => ({
                    id: flight.id,
                    mode: 'flight',
                    source: 'kiwi',
                    operator: getAirlineName(flight.airlines[0]) || flight.airlines[0],
                    airlineCode: flight.airlines[0],
                    from: origin,
                    to: destination,
                    price: Math.round(flight.price),
                    duration: `${Math.floor(flight.fly_duration / 3600)}h ${Math.floor((flight.fly_duration % 3600) / 60)}m`,
                    durationMinutes: Math.floor(flight.fly_duration / 60),
                    startTime: new Date(flight.local_departure).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    endTime: new Date(flight.local_arrival).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    departureAt: flight.local_departure,
                    arrivalAt: flight.local_arrival,
                    stops: flight.route.length - 1,
                    isDirect: flight.route.length === 1,
                    bookingLink: flight.deep_link,
                    airlines: flight.airlines,
                    isLive: true // Real-time price
                })),
                deepLink: generateKiwiLink(origin, destination, depart)
            };
        }

        return {
            success: false,
            usingRealData: false,
            flights: [],
            deepLink: generateKiwiLink(origin, destination, depart),
            error: 'No flights found'
        };

    } catch (error) {
        console.error('❌ Kiwi.com API error:', error);
        return {
            success: false,
            usingRealData: false,
            flights: [],
            deepLink: generateKiwiLink(origin, destination, depart),
            error: error.message
        };
    }
};

/**
 * Get combined flights from Kiwi (live) + Aviasales (cached)
 * Returns deduplicated list sorted by price
 */
export const getCombinedFlights = async (kiwiFlights, aviasalesFlights) => {
    const allFlights = [];
    const seenKeys = new Set();

    // Add Kiwi flights first (live prices)
    kiwiFlights.forEach(f => {
        const key = `${f.price}-${f.airlineCode}-${f.startTime}`;
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            allFlights.push({
                ...f,
                priceType: 'live'
            });
        }
    });

    // Add Aviasales flights (cached)
    aviasalesFlights.forEach(f => {
        const key = `${f.price}-${f.airlineCode}-${f.startTime}`;
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            allFlights.push({
                ...f,
                priceType: 'cached'
            });
        }
    });

    // Sort by price
    allFlights.sort((a, b) => a.price - b.price);

    return allFlights;
};

export { getIATACode, getAirlineName };
