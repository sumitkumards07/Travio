// FlixBus Real UUIDs - Fetched from FlixBus India autocomplete API
// These are 32-character UUIDs, NOT simple numeric IDs
// To update: Run scripts/fetchFlixbusIds.js or manually check shop.flixbus.in
// Generated: 2026-01-15

export const FLIXBUS_UUIDS = {
    // ========== VERIFIED REAL UUIDs ==========
    // These were fetched from FlixBus India autocomplete
    'Delhi': 'a002c4a4-1eef-4afa-82d9-ecd690ea51c5',
    'New Delhi': 'a002c4a4-1eef-4afa-82d9-ecd690ea51c5',
    'Bengaluru': '2e46c6ce-d031-46f2-8ab5-e41038b8a029',
    'Bangalore': '2e46c6ce-d031-46f2-8ab5-e41038b8a029',
    'Hyderabad': '3da253ae-02ca-430c-87e5-22842065a77d',
    'Chennai': '8c1ee239-185f-4f06-912b-5232d0b0489d',
    'Dehradun': '52c74eb5-299b-4207-be30-1aad618958aa',
    'Jaipur': 'b691e973-17a6-4c67-a673-908062270b2f',

    // ========== PLACEHOLDER UUIDs ==========
    // These need to be fetched from shop.flixbus.in
    // Search the city, inspect element, find the UUID in autocomplete option id
    // Format: option-hcr-autocomplete-:r1:-<UUID>
};

// IATA code and alias mapping
export const CITY_ALIASES = {
    'DEL': 'Delhi',
    'BOM': 'Mumbai',
    'BLR': 'Bengaluru',
    'HYD': 'Hyderabad',
    'MAA': 'Chennai',
    'CCU': 'Kolkata',
    'GOI': 'Goa',
    'JAI': 'Jaipur',
    'Bangalore': 'Bengaluru',
    'Trivandrum': 'Thiruvananthapuram',
    'Cochin': 'Kochi',
};

/**
 * Get FlixBus UUID for a city
 * Returns null if city not found (FlixBus link will fallback to homepage)
 */
export const getFlixBusUUID = (city) => {
    // First check direct match
    if (FLIXBUS_UUIDS[city]) {
        return FLIXBUS_UUIDS[city];
    }

    // Check aliases
    const aliasedCity = CITY_ALIASES[city];
    if (aliasedCity && FLIXBUS_UUIDS[aliasedCity]) {
        return FLIXBUS_UUIDS[aliasedCity];
    }

    return null;
};

/**
 * Check if FlixBus has a valid UUID for a city
 */
export const hasFlixBusUUID = (city) => {
    return getFlixBusUUID(city) !== null;
};
