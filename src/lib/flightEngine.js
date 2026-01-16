// Flight Comparison Engine
// Primary: Aviasales (standard flights)
// Cheapest: Kiwi.com (virtual interlining)
// Compensation: AirHelp (delayed/cancelled flights)

const TRAVELPAYOUTS_MARKER = import.meta.env.VITE_TRAVELPAYOUTS_MARKER || '';

// IATA to city mapping
const IATA_CITIES = {
    'DEL': 'Delhi',
    'BOM': 'Mumbai',
    'BLR': 'Bengaluru',
    'HYD': 'Hyderabad',
    'MAA': 'Chennai',
    'CCU': 'Kolkata',
    'GOI': 'Goa',
    'JAI': 'Jaipur',
    'AMD': 'Ahmedabad',
    'PNQ': 'Pune',
    'COK': 'Kochi',
    'LKO': 'Lucknow',
    'VNS': 'Varanasi',
    'ATQ': 'Amritsar',
    'IXC': 'Chandigarh',
    'DXB': 'Dubai',
    'SIN': 'Singapore',
    'BKK': 'Bangkok',
    'LHR': 'London',
    'JFK': 'New York',
};

/**
 * Generate Aviasales deep link
 * Best for: Standard flights (Air India, Emirates, Vistara)
 * Revenue: 40% of their profit (~₹80 per ₹10,000 ticket)
 */
export const getAviasalesLink = (origin, destination, departDate = null, returnDate = null, adults = 1) => {
    const originIATA = origin.length === 3 ? origin : (Object.entries(IATA_CITIES).find(([code, city]) =>
        city.toLowerCase() === origin.toLowerCase())?.[0] || 'DEL');
    const destIATA = destination.length === 3 ? destination : (Object.entries(IATA_CITIES).find(([code, city]) =>
        city.toLowerCase() === destination.toLowerCase())?.[0] || 'BOM');

    const depart = departDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    // Aviasales URL format: /search/ORIGIN-DATE-DEST-RETURN-ADULTS
    let url = `https://www.aviasales.com/search/${originIATA}${depart.replace(/-/g, '').slice(2, 8)}${destIATA}`;

    if (returnDate) {
        url += returnDate.replace(/-/g, '').slice(2, 8);
    }

    url += `${adults}?marker=${TRAVELPAYOUTS_MARKER}`;

    return url;
};

/**
 * Generate Kiwi.com (Tequila) deep link
 * Best for: Budget travelers, Virtual Interlining (Indigo + SpiceJet on one ticket)
 * Revenue: 3% of ticket price (higher than Aviasales for expensive tickets!)
 */
export const getKiwiLink = (origin, destination, departDate = null, returnDate = null, adults = 1) => {
    const originIATA = origin.length === 3 ? origin : 'DEL';
    const destIATA = destination.length === 3 ? destination : 'BOM';

    const depart = departDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    let url = `https://www.kiwi.com/en/search/results/${originIATA}/${destIATA}/${depart}`;

    if (returnDate) {
        url += `/${returnDate}`;
    }

    url += `?adults=${adults}`;

    return url;
};

/**
 * Generate Skyscanner deep link
 */
export const getSkyscannerLink = (origin, destination, departDate = null) => {
    const depart = departDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const formattedDate = depart.replace(/-/g, '').slice(2, 8);

    return `https://www.skyscanner.co.in/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${formattedDate}`;
};

/**
 * Generate AirHelp compensation link
 * For: Flight delays, cancellations, overbooking
 * Revenue: 15% of compensation (e.g., ₹6,000 from ₹40,000 claim!)
 */
export const getAirHelpLink = () => {
    return 'https://www.airhelp.com/en/';
};

/**
 * Generate claim check link
 */
export const getAirHelpClaimLink = (flightNumber = null, date = null) => {
    if (flightNumber && date) {
        return `https://www.airhelp.com/en/claim/?flight=${flightNumber}&date=${date}`;
    }
    return 'https://www.airhelp.com/en/claim/';
};

/**
 * Flight providers configuration
 */
export const flightProviders = {
    'aviasales': {
        name: 'Aviasales',
        logo: '✈️',
        color: '#FF6B00',
        tagline: 'Best prices • All major airlines',
        commission: '~₹80 per ₹10K ticket',
        getLink: getAviasalesLink,
        highlight: true,
        badge: '🔥 Recommended',
        hasAffiliate: true
    },
    'kiwi': {
        name: 'Kiwi.com',
        logo: '🥝',
        color: '#00B4A0',
        tagline: 'Virtual interlining • Hack fares',
        commission: '3% of ticket',
        getLink: getKiwiLink,
        highlight: false,
        badge: '💰 Cheapest Deals',
        hasAffiliate: true
    },
    'skyscanner': {
        name: 'Skyscanner',
        logo: '🔍',
        color: '#0770E3',
        tagline: 'Compare all airlines',
        commission: 'CPC model',
        getLink: getSkyscannerLink,
        highlight: false,
        badge: null,
        hasAffiliate: false
    }
};

/**
 * Get all flight comparison links
 */
export const getFlightComparisonLinks = (origin, destination, departDate = null, returnDate = null) => {
    const links = [];

    // Aviasales first (main partner)
    links.push({
        provider: 'aviasales',
        ...flightProviders.aviasales,
        link: flightProviders.aviasales.getLink(origin, destination, departDate, returnDate),
    });

    // Kiwi for cheap deals
    links.push({
        provider: 'kiwi',
        ...flightProviders.kiwi,
        link: flightProviders.kiwi.getLink(origin, destination, departDate, returnDate),
    });

    // Skyscanner for comparison
    links.push({
        provider: 'skyscanner',
        ...flightProviders.skyscanner,
        link: flightProviders.skyscanner.getLink(origin, destination, departDate),
    });

    return links;
};

/**
 * AirHelp service for compensation
 */
export const airHelpService = {
    name: 'AirHelp',
    logo: '🆘',
    color: '#FF4444',
    tagline: 'Get up to ₹50,000 for delays/cancellations',
    commission: '15% of claim',
    link: getAirHelpLink(),
    claimLink: getAirHelpClaimLink,

    // Compensation amounts (EU regulations)
    compensationGuide: {
        'short': { distance: '< 1,500 km', amount: '€250 (~₹22,000)' },
        'medium': { distance: '1,500-3,500 km', amount: '€400 (~₹35,000)' },
        'long': { distance: '> 3,500 km', amount: '€600 (~₹53,000)' }
    },

    // Eligible scenarios
    eligibility: [
        'Flight delayed 3+ hours',
        'Flight cancelled < 14 days before',
        'Denied boarding (oversold)',
        'Missed connection (airline fault)'
    ]
};

export { IATA_CITIES };
