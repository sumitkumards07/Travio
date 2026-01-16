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
 * Docs: https://support.travelpayouts.com/hc/en-us/articles/203956163-Aviasales-Data-API
 * Returns cached prices from last 48 hours of user searches
 */
export const searchCheapestFlights = async (origin, destination, departDate = null) => {
    const originIATA = getIATACode(origin);
    const destIATA = getIATACode(destination);

    // Default to tomorrow if no date
    const depart = departDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    console.log('🛫 Aviasales API call:', { origin, destination, originIATA, destIATA, depart, token: API_TOKEN ? 'SET' : 'MISSING' });

    // Parameters based on official docs:
    // limit=50 (max 1000), sorting=price, market=in (India), direct=false (include connecting)
    const apiUrl = `${FLIGHT_SEARCH_API}/prices_for_dates?origin=${originIATA}&destination=${destIATA}&departure_at=${depart}&currency=inr&limit=50&sorting=price&direct=false&market=in&token=${API_TOKEN}`;
    console.log('📡 API URL:', apiUrl);

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
            }
        });

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
                duration: f.duration ? `${Math.floor(f.duration / 60)}h ${f.duration % 60}m` : '2h 30m',
                startTime: new Date(f.departureAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                endTime: new Date(new Date(f.departureAt).getTime() + (f.duration || 150) * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                stops: f.transfers || 0,
                bookingLink: f.link,
                airline: f.airline,
                flightNumber: f.flightNumber,
                departureAt: f.departureAt
            }))
        };
    }

    console.log('⚠️ No real data, using mock fallback');
    return { source: 'mock', usingRealData: false, flights: [] };
};

/**
 * Fetch cheapest tickets from /v1/prices/cheap endpoint
 * Returns cheapest non-stop, 1-stop, and 2-stop tickets
 */
export const fetchCheapTickets = async (origin, destination, departMonth = null) => {
    const originIATA = getIATACode(origin);
    const destIATA = getIATACode(destination);
    const month = departMonth || new Date().toISOString().slice(0, 7); // YYYY-MM

    try {
        const response = await fetch(
            `${isDev ? '/api/aviasales/v1' : 'https://api.travelpayouts.com/v1'}/prices/cheap?origin=${originIATA}&destination=${destIATA}&depart_date=${month}&currency=inr&token=${API_TOKEN}`
        );

        if (!response.ok) return { success: false, tickets: {} };

        const data = await response.json();
        if (data.success && data.data && data.data[destIATA]) {
            return { success: true, tickets: data.data[destIATA] };
        }
        return { success: false, tickets: {} };
    } catch (error) {
        console.error('Cheap tickets API error:', error);
        return { success: false, tickets: {} };
    }
};

/**
 * Fetch direct/non-stop flights only
 */
export const fetchDirectFlights = async (origin, destination, departMonth = null) => {
    const originIATA = getIATACode(origin);
    const destIATA = getIATACode(destination);
    const month = departMonth || new Date().toISOString().slice(0, 7);

    try {
        const response = await fetch(
            `${isDev ? '/api/aviasales/v1' : 'https://api.travelpayouts.com/v1'}/prices/direct?origin=${originIATA}&destination=${destIATA}&depart_date=${month}&currency=inr&token=${API_TOKEN}`
        );

        if (!response.ok) return { success: false, tickets: {} };

        const data = await response.json();
        if (data.success && data.data && data.data[destIATA]) {
            return { success: true, tickets: data.data[destIATA] };
        }
        return { success: false, tickets: {} };
    } catch (error) {
        console.error('Direct flights API error:', error);
        return { success: false, tickets: {} };
    }
};

/**
 * COMPREHENSIVE FLIGHT COMPARISON
 * Fetches from multiple endpoints and combines results for in-app display
 */
export const getComprehensiveFlights = async (origin, destination, departDate = null) => {
    const originIATA = getIATACode(origin);
    const destIATA = getIATACode(destination);
    const depart = departDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const departMonth = depart.slice(0, 7);

    console.log('✈️ Comprehensive flight search:', originIATA, '→', destIATA);

    const allFlights = [];
    const seenPrices = new Set(); // Deduplicate by price+airline

    // 1. Fetch from prices_for_dates (main endpoint)
    try {
        const pricesResult = await searchCheapestFlights(origin, destination, depart);
        if (pricesResult.success) {
            pricesResult.flights.forEach(f => {
                const key = `${f.price}-${f.airline}`;
                if (!seenPrices.has(key)) {
                    seenPrices.add(key);
                    allFlights.push({
                        ...f,
                        source: 'prices_for_dates'
                    });
                }
            });
        }
    } catch (e) { console.error('prices_for_dates error:', e); }

    // 2. Fetch from v1/prices/cheap (cheapest per stop type)
    try {
        const cheapResult = await fetchCheapTickets(origin, destination, departMonth);
        if (cheapResult.success) {
            Object.entries(cheapResult.tickets).forEach(([stops, ticket]) => {
                const key = `${ticket.price}-${ticket.airline}`;
                if (!seenPrices.has(key)) {
                    seenPrices.add(key);
                    allFlights.push({
                        price: ticket.price,
                        airline: ticket.airline,
                        flightNumber: ticket.flight_number,
                        departureAt: ticket.departure_at,
                        returnAt: ticket.return_at,
                        transfers: parseInt(stops),
                        origin: originIATA,
                        destination: destIATA,
                        link: generateBookingLink(originIATA, destIATA, depart),
                        source: 'prices_cheap'
                    });
                }
            });
        }
    } catch (e) { console.error('prices_cheap error:', e); }

    // 3. Fetch direct flights separately
    try {
        const directResult = await fetchDirectFlights(origin, destination, departMonth);
        if (directResult.success) {
            Object.entries(directResult.tickets).forEach(([stops, ticket]) => {
                const key = `${ticket.price}-${ticket.airline}`;
                if (!seenPrices.has(key)) {
                    seenPrices.add(key);
                    allFlights.push({
                        price: ticket.price,
                        airline: ticket.airline,
                        flightNumber: ticket.flight_number,
                        departureAt: ticket.departure_at,
                        transfers: 0,
                        origin: originIATA,
                        destination: destIATA,
                        link: generateBookingLink(originIATA, destIATA, depart),
                        source: 'prices_direct',
                        isDirect: true
                    });
                }
            });
        }
    } catch (e) { console.error('prices_direct error:', e); }

    // Sort by price
    allFlights.sort((a, b) => a.price - b.price);

    console.log(`✅ Found ${allFlights.length} unique flights from ${new Set(allFlights.map(f => f.source)).size} sources`);

    return {
        success: allFlights.length > 0,
        flights: allFlights.map(f => ({
            id: `${f.airline}-${f.flightNumber || Math.random().toString(36).substr(2, 6)}`,
            mode: 'flight',
            operator: getAirlineName(f.airline),
            airlineCode: f.airline,
            from: origin,
            to: destination,
            price: f.price,
            duration: f.duration ? `${Math.floor(f.duration / 60)}h ${f.duration % 60}m` : estimateDuration(originIATA, destIATA),
            startTime: f.departureAt ? new Date(f.departureAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '06:00',
            endTime: f.departureAt ? new Date(new Date(f.departureAt).getTime() + 2.5 * 60 * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '08:30',
            stops: f.transfers || 0,
            isDirect: f.transfers === 0,
            bookingLink: f.link,
            source: f.source
        })),
        totalSources: new Set(allFlights.map(f => f.source)).size,
        cheapest: allFlights[0]?.price
    };
};

// Estimate flight duration based on common routes
const estimateDuration = (origin, dest) => {
    const durations = {
        'DEL-BOM': '2h 10m', 'BOM-DEL': '2h 10m',
        'DEL-BLR': '2h 45m', 'BLR-DEL': '2h 45m',
        'DEL-HYD': '2h 15m', 'HYD-DEL': '2h 15m',
        'DEL-MAA': '2h 50m', 'MAA-DEL': '2h 50m',
        'BOM-BLR': '1h 30m', 'BLR-BOM': '1h 30m',
        'BOM-HYD': '1h 20m', 'HYD-BOM': '1h 20m',
    };
    return durations[`${origin}-${dest}`] || '2h 30m';
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
