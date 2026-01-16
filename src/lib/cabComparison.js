// Cab & Airport Transfer Comparison Service
// Deep links to GetTransfer, Kiwitaxi, Welcome Pickups
// Revenue: 9-11% commission per booking

// Airport codes for deep linking
const AIRPORT_CODES = {
    'Delhi': 'DEL',
    'New Delhi': 'DEL',
    'Mumbai': 'BOM',
    'Bengaluru': 'BLR',
    'Bangalore': 'BLR',
    'Hyderabad': 'HYD',
    'Chennai': 'MAA',
    'Kolkata': 'CCU',
    'Goa': 'GOI',
    'Jaipur': 'JAI',
    'Ahmedabad': 'AMD',
    'Pune': 'PNQ',
    'Kochi': 'COK',
    'Lucknow': 'LKO',
    'Varanasi': 'VNS',
    'Amritsar': 'ATQ',
    'Chandigarh': 'IXC',
    'Guwahati': 'GAU',
    'Thiruvananthapuram': 'TRV',
    'Mangalore': 'IXE',
};

/**
 * Generate GetTransfer deep link
 * Known for: Bidding system (drivers bid prices), long distance
 * Commission: ~10%
 */
export const getGetTransferLink = (pickup, dropoff, date = null) => {
    const dateStr = date || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // GetTransfer uses city names in URL
    const from = encodeURIComponent(pickup);
    const to = encodeURIComponent(dropoff);

    return `https://gettransfer.com/en/routes?from=${from}&to=${to}&date=${dateStr}&passengers=2`;
};

/**
 * Generate Kiwitaxi deep link
 * Known for: Fixed price airport transfers
 * Commission: ~9%
 */
export const getKiwitaxiLink = (pickup, dropoff, date = null) => {
    const dateStr = date || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const from = encodeURIComponent(pickup);
    const to = encodeURIComponent(dropoff);

    return `https://kiwitaxi.com/search?from=${from}&to=${to}&date=${dateStr}`;
};

/**
 * Generate Welcome Pickups deep link
 * Known for: Premium service, meet & greet at airport
 * Commission: ~11%
 */
export const getWelcomePickupsLink = (pickup, dropoff) => {
    // Welcome Pickups focuses on airport transfers
    const from = encodeURIComponent(pickup);
    const to = encodeURIComponent(dropoff);

    return `https://www.welcomepickups.com/search?pickup=${from}&dropoff=${to}`;
};

/**
 * Generate Savaari link (India-specific)
 * Local Indian cab service
 */
export const getSavaariLink = (pickup, dropoff, date = null) => {
    const dateStr = date || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const from = pickup.toLowerCase().replace(/\s+/g, '-');
    const to = dropoff.toLowerCase().replace(/\s+/g, '-');

    return `https://www.savaari.com/cab/${from}-to-${to}`;
};

/**
 * Cab providers configuration
 */
export const cabProviders = {
    'gettransfer': {
        name: 'GetTransfer',
        logo: '🚗',
        color: '#FF6B00',
        tagline: 'Drivers bid prices • Best for long distance',
        commission: '10%',
        getLink: getGetTransferLink,
        highlight: true,
        badge: '💰 Get Lowest Bids'
    },
    'kiwitaxi': {
        name: 'Kiwitaxi',
        logo: '🚕',
        color: '#00B4D8',
        tagline: 'Fixed prices • Airport transfers',
        commission: '9%',
        getLink: getKiwitaxiLink,
        highlight: false,
        badge: null
    },
    'welcomepickups': {
        name: 'Welcome Pickups',
        logo: '✨',
        color: '#6366F1',
        tagline: 'Premium meet & greet service',
        commission: '11%',
        getLink: getWelcomePickupsLink,
        highlight: false,
        badge: '⭐ Premium'
    },
    'savaari': {
        name: 'Savaari',
        logo: '🇮🇳',
        color: '#10B981',
        tagline: 'India\'s largest cab network',
        commission: '5%',
        getLink: getSavaariLink,
        highlight: false,
        badge: '🇮🇳 Local'
    }
};

/**
 * Get all cab comparison links for a route
 */
export const getCabComparisonLinks = (pickup, dropoff, date = null) => {
    return Object.entries(cabProviders).map(([key, provider]) => ({
        provider: key,
        ...provider,
        link: provider.getLink(pickup, dropoff, date),
        available: true
    }));
};

/**
 * Check if pickup is an airport
 */
export const isAirportTransfer = (location) => {
    const airportKeywords = ['airport', 'terminal', 'aerodrome'];
    const lowerLocation = location.toLowerCase();

    // Check if location mentions airport
    if (airportKeywords.some(kw => lowerLocation.includes(kw))) {
        return true;
    }

    // Check if it's an airport code
    return Object.values(AIRPORT_CODES).includes(location.toUpperCase());
};

/**
 * Get airport-specific transfer links
 */
export const getAirportTransferLinks = (airportCode, destination, date = null) => {
    const airport = `${airportCode} Airport`;
    return getCabComparisonLinks(airport, destination, date);
};

export { AIRPORT_CODES };
