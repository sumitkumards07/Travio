// Aviasales Flight API Integration
// Real-time flight search using Travelpayouts/Aviasales APIs
// Docs: https://support.travelpayouts.com/hc/en-us/articles/203956163-Travel-Data-API

const API_TOKEN = import.meta.env.VITE_TRAVELPAYOUTS_TOKEN || '';
const PARTNER_ID = import.meta.env.VITE_TRAVELPAYOUTS_MARKER || '';

// Base URLs - use proxy in dev to avoid CORS
const isDev = import.meta.env.DEV;
const FLIGHT_SEARCH_API = isDev ? '/api/aviasales/aviasales/v3' : 'https://api.travelpayouts.com/aviasales/v3';
const FLIGHT_DATA_API = isDev ? '/api/aviasales/v2' : 'https://api.travelpayouts.com/v2';


// IATA code mapping
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
    'Lucknow': 'LKO',
    'Varanasi': 'VNS',
    'Amritsar': 'ATQ',
    'Chandigarh': 'IXC',
    'Guwahati': 'GAU',
    'Thiruvananthapuram': 'TRV', 'Trivandrum': 'TRV',
    'Mangalore': 'IXE',
    'Vijayawada': 'VGA',
    'Visakhapatnam': 'VTZ', 'Vizag': 'VTZ',
    'Srinagar': 'SXR',
    'Leh': 'IXL',
    'Bagdogra': 'IXB',
    'Patna': 'PAT',
    'Bhubaneswar': 'BBI',
    'Ranchi': 'IXR',
    'Raipur': 'RPR',
    'Indore': 'IDR',
    'Bhopal': 'BHO',
    'Nagpur': 'NAG',
    'Coimbatore': 'CJB',
    'Madurai': 'IXM',
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

/**
 * Search for cheapest flights (Prices API - cached data)
 * Good for showing "Flights from ₹X" indicators
 */
export const searchCheapestFlights = async (origin, destination, departDate = null) => {
    const originIATA = getIATACode(origin);
    const destIATA = getIATACode(destination);
    const depart = departDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    try {
        const response = await fetch(
            `${FLIGHT_SEARCH_API}/prices_for_dates?origin=${originIATA}&destination=${destIATA}&departure_at=${depart}&currency=inr&token=${API_TOKEN}`,
            {
                headers: {
                    'Accept': 'application/json',
                }
            }
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
            return {
                success: true,
                flights: data.data.map(flight => ({
                    price: flight.price,
                    airline: flight.airline,
                    flightNumber: flight.flight_number,
                    departureAt: flight.departure_at,
                    returnAt: flight.return_at,
                    transfers: flight.transfers,
                    origin: flight.origin,
                    destination: flight.destination,
                    link: generateBookingLink(originIATA, destIATA, depart, flight)
                })),
                cheapest: data.data[0]?.price,
                currency: 'INR'
            };
        }

        return { success: false, flights: [], error: 'No flights found' };
    } catch (error) {
        console.error('Aviasales API error:', error);
        return { success: false, flights: [], error: error.message };
    }
};

/**
 * Get prices calendar (cheapest prices for each day)
 */
export const getPricesCalendar = async (origin, destination, month = null) => {
    const originIATA = getIATACode(origin);
    const destIATA = getIATACode(destination);
    const targetMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM

    try {
        const response = await fetch(
            `${FLIGHT_DATA_API}/prices/month-matrix?origin=${originIATA}&destination=${destIATA}&month=${targetMonth}&currency=inr&token=${API_TOKEN}`
        );

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();

        if (data.success && data.data) {
            return {
                success: true,
                prices: data.data,
                cheapestDay: Object.entries(data.data).sort((a, b) => a[1].price - b[1].price)[0]
            };
        }

        return { success: false, prices: {} };
    } catch (error) {
        console.error('Calendar API error:', error);
        return { success: false, prices: {}, error: error.message };
    }
};

/**
 * Get popular destinations from an origin
 */
export const getPopularDestinations = async (origin) => {
    const originIATA = getIATACode(origin);

    try {
        const response = await fetch(
            `${FLIGHT_DATA_API}/prices/cheap?origin=${originIATA}&currency=inr&token=${API_TOKEN}`
        );

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();

        if (data.success && data.data) {
            // Convert to array and sort by price
            const destinations = Object.entries(data.data).map(([dest, flights]) => ({
                destination: dest,
                ...Object.values(flights)[0]
            })).sort((a, b) => a.price - b.price);

            return { success: true, destinations: destinations.slice(0, 10) };
        }

        return { success: false, destinations: [] };
    } catch (error) {
        console.error('Popular destinations error:', error);
        return { success: false, destinations: [], error: error.message };
    }
};

/**
 * Get airline info
 */
export const getAirlineInfo = async (iataCode) => {
    try {
        const response = await fetch(
            `${FLIGHT_DATA_API}/data/airlines?iata=${iataCode}&token=${API_TOKEN}`
        );

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        return data.data?.[0] || null;
    } catch (error) {
        return null;
    }
};

/**
 * Generate Aviasales booking link with affiliate tracking
 */
export const generateBookingLink = (origin, destination, departDate, flightData = null) => {
    const depart = departDate.replace(/-/g, '').slice(2, 8);

    let url = `https://www.aviasales.com/search/${origin}${depart}${destination}1`;

    if (PARTNER_ID) {
        url += `?marker=${PARTNER_ID}`;
    }

    return url;
};

/**
 * Generate Kiwi.com link for comparison (virtual interlining)
 */
export const generateKiwiLink = (origin, destination, departDate) => {
    const originIATA = getIATACode(origin);
    const destIATA = getIATACode(destination);
    const depart = departDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    return `https://www.kiwi.com/en/search/results/${originIATA}/${destIATA}/${depart}?adults=1`;
};

/**
 * Search flights with real API + fallback
 */
export const searchFlightsReal = async (origin, destination, departDate = null, returnDate = null) => {
    console.log('🔍 Searching Aviasales API for:', origin, '→', destination);

    const result = await searchCheapestFlights(origin, destination, departDate);

    if (result.success && result.flights.length > 0) {
        console.log('✅ Real flight data received:', result.flights.length, 'results');
        return {
            source: 'aviasales',
            usingRealData: true,
            flights: result.flights.map(f => ({
                id: `${f.airline}-${f.flightNumber || Math.random().toString(36).substr(2, 6)}`,
                mode: 'flight',
                operator: getAirlineName(f.airline),
                from: origin,
                to: destination,
                price: f.price,
                duration: calculateDuration(f.departureAt, f.returnAt) || '2h 30m',
                startTime: new Date(f.departureAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                endTime: new Date(new Date(f.departureAt).getTime() + 2.5 * 60 * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                stops: f.transfers || 0,
                bookingLink: f.link
            }))
        };
    }

    console.log('⚠️ No real data, using mock fallback');
    return { source: 'mock', usingRealData: false, flights: [] };
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
};

const getAirlineName = (code) => AIRLINE_NAMES[code] || code;

const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) return null;
    const diff = new Date(arrival) - new Date(departure);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
};

export { CITY_TO_IATA, getIATACode, getAirlineName };
