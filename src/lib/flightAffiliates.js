// Aviasales Flight Affiliate Links Generator
// Creates deep links to Aviasales with your Travelpayouts marker

const MARKER = import.meta.env.VITE_TRAVELPAYOUTS_MARKER || '';

// City to IATA code mapping
const cityToIATA = {
    'DEL': 'DEL', // Delhi
    'BOM': 'BOM', // Mumbai
    'BLR': 'BLR', // Bangalore
    'HYD': 'HYD', // Hyderabad
    'MAA': 'MAA', // Chennai
    'CCU': 'CCU', // Kolkata
    'GOI': 'GOI', // Goa
    'JAI': 'JAI', // Jaipur
    'VGA': 'VGA', // Vijayawada
    'AMD': 'AMD', // Ahmedabad
};

/**
 * Generate Aviasales deep link for flight search
 * @param {string} origin - Origin city code (e.g., 'DEL')
 * @param {string} destination - Destination city code (e.g., 'BOM')
 * @param {string} departDate - Departure date in YYYY-MM-DD format (optional)
 * @param {string} returnDate - Return date in YYYY-MM-DD format (optional)
 * @param {number} adults - Number of adults (default: 1)
 * @returns {string} - Aviasales affiliate link
 */
export const getAviasalesLink = (origin, destination, departDate = null, returnDate = null, adults = 1) => {
    const originIATA = cityToIATA[origin] || origin;
    const destIATA = cityToIATA[destination] || destination;

    // Default to tomorrow if no date provided
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    const depart = departDate || defaultDate.toISOString().split('T')[0];

    let url = `https://www.aviasales.com/search/${originIATA}${depart.replace(/-/g, '').slice(2, 8)}${destIATA}`;

    if (returnDate) {
        url += returnDate.replace(/-/g, '').slice(2, 8);
    }

    url += `${adults}?marker=${MARKER}`;

    return url;
};

/**
 * Generate Jetradar (alternative) deep link
 */
export const getJetradarLink = (origin, destination, departDate = null) => {
    const originIATA = cityToIATA[origin] || origin;
    const destIATA = cityToIATA[destination] || destination;

    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    const depart = departDate || defaultDate.toISOString().split('T')[0];

    return `https://www.jetradar.com/flights/?origin_iata=${originIATA}&destination_iata=${destIATA}&depart_date=${depart}&adults=1&marker=${MARKER}`;
};

/**
 * Generate Hotellook deep link for hotel search
 */
export const getHotellookLink = (cityName, checkIn = null) => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    const checkInDate = checkIn || defaultDate.toISOString().split('T')[0];

    return `https://www.hotellook.com/hotels/${encodeURIComponent(cityName.toLowerCase())}?checkIn=${checkInDate}&marker=${MARKER}`;
};

/**
 * Flight providers with affiliate-enabled booking links
 */
export const flightProviders = {
    'aviasales': {
        name: 'Aviasales',
        logo: '✈️',
        color: '#FF6B00',
        getLink: getAviasalesLink
    },
    'jetradar': {
        name: 'Jetradar',
        logo: '🛫',
        color: '#4A90D9',
        getLink: getJetradarLink
    }
};

/**
 * Indian OTA deep links (direct, no affiliate conversion yet)
 */
export const indianOTAs = {
    'makemytrip': {
        name: 'MakeMyTrip',
        logo: '🔴',
        color: '#F44336',
        getLink: (from, to) => `https://www.makemytrip.com/flight/search?itinerary=${from}-${to}&tripType=O&paxType=A-1`
    },
    'goibibo': {
        name: 'Goibibo',
        logo: '🟠',
        color: '#EC5B24',
        getLink: (from, to) => `https://www.goibibo.com/flights/air-${from}-${to}/`
    },
    'ixigo': {
        name: 'Ixigo',
        logo: '🟢',
        color: '#00BCD4',
        getLink: (from, to) => `https://www.ixigo.com/search/result/flight?from=${from}&to=${to}&date=${new Date().toISOString().split('T')[0]}&adults=1`
    },
    'cleartrip': {
        name: 'Cleartrip',
        logo: '🔵',
        color: '#E85722',
        getLink: (from, to) => `https://www.cleartrip.com/flights/results?adults=1&childs=0&infants=0&class=Economy&origin=${from}&destination=${to}`
    }
};

/**
 * Get all flight comparison links for a route
 */
export const getFlightComparisonLinks = (origin, destination, departDate = null) => {
    return [
        {
            provider: 'aviasales',
            ...flightProviders.aviasales,
            link: flightProviders.aviasales.getLink(origin, destination, departDate),
            hasAffiliate: true
        },
        {
            provider: 'makemytrip',
            ...indianOTAs.makemytrip,
            link: indianOTAs.makemytrip.getLink(origin, destination),
            hasAffiliate: false
        },
        {
            provider: 'goibibo',
            ...indianOTAs.goibibo,
            link: indianOTAs.goibibo.getLink(origin, destination),
            hasAffiliate: false
        },
        {
            provider: 'ixigo',
            ...indianOTAs.ixigo,
            link: indianOTAs.ixigo.getLink(origin, destination),
            hasAffiliate: false
        }
    ];
};
