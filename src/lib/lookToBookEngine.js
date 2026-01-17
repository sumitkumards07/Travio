// Look-to-Book Flight Engine
// Orchestrates the "Look" (Amadeus GDS) and "Book" (Aviasales Deep Link) strategy
// Implements 24-hour caching to stay under 2,000 monthly Amadeus requests

import { getCachedFlights, setCachedFlights, getCacheStats } from './smartFlightCache.js';
import { canMakeRequest, recordRequest, getQuotaStatus } from './amadeusQuotaManager.js';
import { searchFlights as searchAmadeusFlights, checkAmadeusStatus } from './amadeusAPI.js';
import { searchCheapestFlights, getComprehensiveFlights, CITY_TO_IATA, getIATACode } from './aviasalesAPI.js';

const AVIASALES_MARKER = import.meta.env.VITE_TRAVELPAYOUTS_MARKER || '';

/**
 * Generate Aviasales deep link in the exact required format
 * Format: https://www.aviasales.com/search/{ORIGIN}{DDMM}{DEST}1?marker={MARKER}
 * @param {string} origin - Origin IATA code
 * @param {string} destination - Destination IATA code
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} adults - Number of adults (default: 1)
 * @returns {string} - Aviasales affiliate deep link
 */
export const generateAviasalesDeepLink = (origin, destination, date, adults = 1) => {
    const originIATA = getIATACode(origin);
    const destIATA = getIATACode(destination);

    // Convert YYYY-MM-DD to DDMM format for Aviasales
    // Example: 2026-05-20 → 2005
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const aviasalesDate = `${day}${month}`; // DDMM format

    // Build the deep link
    const deepLink = `https://www.aviasales.com/search/${originIATA}${aviasalesDate}${destIATA}${adults}?marker=${AVIASALES_MARKER}`;

    return deepLink;
};

/**
 * Main Look-to-Book search function
 * Priority: Cache → Amadeus (if quota available) → Aviasales Data API
 * 
 * @param {string} origin - Origin city/IATA code
 * @param {string} destination - Destination city/IATA code
 * @param {string} departDate - Departure date (YYYY-MM-DD)
 * @param {number} adults - Number of adults
 * @returns {object} - Search results with source info
 */
export const lookToBookSearch = async (origin, destination, departDate = null, adults = 1) => {
    const originIATA = getIATACode(origin);
    const destIATA = getIATACode(destination);
    const date = departDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    console.log(`\n🔍 [LOOK-TO-BOOK] Searching ${originIATA}→${destIATA} on ${date}`);

    // PHASE 1: Check Cache (FREE)
    const cached = getCachedFlights(originIATA, destIATA, date);
    if (cached) {
        // Add fresh booking links to cached data
        const resultsWithLinks = addBookingLinks(cached.data, originIATA, destIATA, date);

        return {
            success: true,
            source: 'cache',
            sourceLabel: '📦 Cached Result',
            sourceDetail: cached.ageHuman,
            flights: resultsWithLinks,
            quotaSaved: true,
            cacheStats: getCacheStats()
        };
    }

    // PHASE 2: Check Quota & Call Amadeus (LIVE GDS DATA)
    const quotaCheck = canMakeRequest();

    if (quotaCheck.allowed) {
        console.log(`📡 [LOOK PHASE] Calling Amadeus Live GDS API...`);

        const amadeusStatus = await checkAmadeusStatus();
        if (amadeusStatus) {
            const amadeusResults = await searchAmadeusFlights(originIATA, destIATA, date, adults);

            if (amadeusResults && amadeusResults.length > 0) {
                // Record the API usage
                recordRequest();

                // Add Aviasales booking links (BOOK phase)
                const resultsWithLinks = addBookingLinks(amadeusResults, originIATA, destIATA, date);

                // Save to cache for 24 hours
                setCachedFlights(originIATA, destIATA, date, resultsWithLinks);

                return {
                    success: true,
                    source: 'amadeus_live',
                    sourceLabel: '🛫 Live GDS Data',
                    sourceDetail: 'Amadeus',
                    flights: resultsWithLinks,
                    quotaUsed: 1,
                    quotaStatus: getQuotaStatus(),
                    cacheStats: getCacheStats()
                };
            }
        }
    } else {
        console.warn(`⚠️ [QUOTA EXCEEDED] ${quotaCheck.reason}`);
    }

    // PHASE 3: Fallback to Aviasales Cached Data API
    console.log(`📊 [FALLBACK] Using Aviasales cached data...`);

    const aviasalesResult = await getComprehensiveFlights(origin, destination, date);

    if (aviasalesResult.success && aviasalesResult.flights.length > 0) {
        // Transform to consistent format with booking links
        const resultsWithLinks = aviasalesResult.flights.map(flight => ({
            ...flight,
            bookingLink: generateAviasalesDeepLink(originIATA, destIATA, date),
            source: 'aviasales_data'
        }));

        return {
            success: true,
            source: 'aviasales_data',
            sourceLabel: '💰 Aviasales Data',
            sourceDetail: 'Cached prices (updated hourly)',
            flights: resultsWithLinks,
            quotaUsed: 0,
            quotaStatus: quotaCheck.allowed ? null : getQuotaStatus(),
            cacheStats: getCacheStats()
        };
    }

    // No results from any source
    return {
        success: false,
        source: 'none',
        sourceLabel: '❌ No Results',
        flights: [],
        error: 'No flights found from any source'
    };
};

/**
 * Add Aviasales booking links to flight results
 */
const addBookingLinks = (flights, origin, dest, date) => {
    return flights.map(flight => ({
        ...flight,
        bookingLink: generateAviasalesDeepLink(origin, dest, date),
        source: flight.isAmadeus ? 'amadeus_live' : (flight.source || 'unknown')
    }));
};

/**
 * Get cheapest flight from Aviasales for price comparison
 * Used to show "Cheapest Deal" badge alongside live results
 */
export const getCheapestDeal = async (origin, destination, date) => {
    const originIATA = getIATACode(origin);
    const destIATA = getIATACode(destination);

    try {
        const result = await searchCheapestFlights(origin, destination, date);

        if (result.success && result.flights.length > 0) {
            const cheapest = result.flights[0];

            return {
                success: true,
                price: cheapest.price,
                airline: cheapest.airline,
                link: generateAviasalesDeepLink(originIATA, destIATA, date),
                badge: '🔥 Cheapest Found',
                source: 'aviasales'
            };
        }

        return { success: false };
    } catch (error) {
        console.error('Cheapest deal fetch error:', error);
        return { success: false };
    }
};

/**
 * Hybrid search combining Amadeus live data with Aviasales price comparison
 * Returns both sources for user comparison
 */
export const hybridFlightSearch = async (origin, destination, date, adults = 1) => {
    // Run both searches in parallel
    const [lookToBookResult, cheapestDeal] = await Promise.all([
        lookToBookSearch(origin, destination, date, adults),
        getCheapestDeal(origin, destination, date)
    ]);

    // If cheapest deal is better than any live result, add it to the list
    if (cheapestDeal.success && lookToBookResult.success) {
        const lowestLivePrice = lookToBookResult.flights.length > 0
            ? Math.min(...lookToBookResult.flights.map(f => f.price))
            : Infinity;

        if (cheapestDeal.price < lowestLivePrice) {
            // Add cheapest deal as first result with special badge
            lookToBookResult.flights.unshift({
                id: 'cheapest-deal',
                mode: 'flight',
                operator: cheapestDeal.airline,
                price: cheapestDeal.price,
                bookingLink: cheapestDeal.link,
                badge: cheapestDeal.badge,
                source: 'aviasales_cheapest',
                isSpecialDeal: true
            });
        }
    }

    return {
        ...lookToBookResult,
        cheapestDeal: cheapestDeal.success ? cheapestDeal : null
    };
};

/**
 * Get current system status for debugging
 */
export const getSystemStatus = () => {
    return {
        cache: getCacheStats(),
        quota: getQuotaStatus(),
        marker: AVIASALES_MARKER ? 'Configured' : 'Missing'
    };
};

export default {
    lookToBookSearch,
    hybridFlightSearch,
    generateAviasalesDeepLink,
    getCheapestDeal,
    getSystemStatus
};
