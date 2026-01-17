// Smart Flight Cache System
// 16-hour localStorage cache to minimize Amadeus API calls
// Part of the "Look-to-Book" strategy

const CACHE_PREFIX = 'travio_flights_';
const CACHE_TTL_HOURS = 16;
const CACHE_STATS_KEY = 'travio_cache_stats';

/**
 * Generate cache key for a flight search
 * @param {string} origin - Origin IATA code
 * @param {string} dest - Destination IATA code  
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {string} - Cache key
 */
export const generateCacheKey = (origin, dest, date) => {
    return `${CACHE_PREFIX}${origin}_${dest}_${date}`;
};

/**
 * Get cached flight results
 * @param {string} origin - Origin IATA code
 * @param {string} dest - Destination IATA code
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {object|null} - Cached data or null if expired/missing
 */
export const getCachedFlights = (origin, dest, date) => {
    const key = generateCacheKey(origin, dest, date);

    try {
        const cached = localStorage.getItem(key);
        if (!cached) {
            recordCacheStat('miss');
            return null;
        }

        const parsed = JSON.parse(cached);
        const cacheAge = Date.now() - parsed.timestamp;
        const maxAge = CACHE_TTL_HOURS * 60 * 60 * 1000; // 24 hours in ms

        if (cacheAge > maxAge) {
            // Cache expired
            console.log(`⌛ [CACHE EXPIRED] ${origin}→${dest} cache is ${Math.round(cacheAge / 3600000)}h old`);
            localStorage.removeItem(key);
            recordCacheStat('expired');
            return null;
        }

        // Cache hit!
        const ageMinutes = Math.round(cacheAge / 60000);
        console.log(`⚡ [CACHE HIT] Loading ${origin}→${dest} from memory. Age: ${ageMinutes}min (Cost: 0 API Units)`);
        recordCacheStat('hit');

        return {
            data: parsed.data,
            timestamp: parsed.timestamp,
            age: cacheAge,
            ageHuman: ageMinutes < 60 ? `${ageMinutes}min ago` : `${Math.round(ageMinutes / 60)}h ago`,
            source: 'cache'
        };
    } catch (error) {
        console.error('Cache read error:', error);
        return null;
    }
};

/**
 * Save flight results to cache
 * @param {string} origin - Origin IATA code
 * @param {string} dest - Destination IATA code
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {array} flights - Flight results to cache
 * @returns {boolean} - Success status
 */
export const setCachedFlights = (origin, dest, date, flights) => {
    const key = generateCacheKey(origin, dest, date);

    try {
        const cacheEntry = {
            data: flights,
            timestamp: Date.now(),
            origin,
            dest,
            date,
            flightCount: flights.length
        };

        localStorage.setItem(key, JSON.stringify(cacheEntry));
        console.log(`💾 [CACHE SAVE] Stored ${flights.length} flights for ${origin}→${dest} (TTL: 24h)`);
        recordCacheStat('save');

        // Cleanup old entries
        cleanupExpiredCache();

        return true;
    } catch (error) {
        console.error('Cache write error:', error);
        // Handle quota exceeded
        if (error.name === 'QuotaExceededError') {
            console.warn('⚠️ LocalStorage full, clearing old cache...');
            clearAllFlightCache();
            // Retry once
            try {
                localStorage.setItem(key, JSON.stringify({
                    data: flights,
                    timestamp: Date.now(),
                    origin, dest, date,
                    flightCount: flights.length
                }));
                return true;
            } catch {
                return false;
            }
        }
        return false;
    }
};

/**
 * Record cache statistics
 * @param {string} type - 'hit', 'miss', 'save', 'expired'
 */
const recordCacheStat = (type) => {
    try {
        const stats = JSON.parse(localStorage.getItem(CACHE_STATS_KEY) || '{}');
        const today = new Date().toISOString().split('T')[0];

        if (!stats[today]) {
            stats[today] = { hits: 0, misses: 0, saves: 0, expired: 0 };
        }

        switch (type) {
            case 'hit': stats[today].hits++; break;
            case 'miss': stats[today].misses++; break;
            case 'save': stats[today].saves++; break;
            case 'expired': stats[today].expired++; break;
        }

        localStorage.setItem(CACHE_STATS_KEY, JSON.stringify(stats));
    } catch (error) {
        // Silently fail stats recording
    }
};

/**
 * Get cache statistics
 * @returns {object} - Cache stats with hit rate and savings
 */
export const getCacheStats = () => {
    try {
        const stats = JSON.parse(localStorage.getItem(CACHE_STATS_KEY) || '{}');
        const today = new Date().toISOString().split('T')[0];
        const todayStats = stats[today] || { hits: 0, misses: 0, saves: 0, expired: 0 };

        // Calculate totals
        let totalHits = 0, totalMisses = 0, totalSaves = 0;
        Object.values(stats).forEach(day => {
            totalHits += day.hits || 0;
            totalMisses += day.misses || 0;
            totalSaves += day.saves || 0;
        });

        const totalRequests = totalHits + totalMisses;
        const hitRate = totalRequests > 0 ? ((totalHits / totalRequests) * 100).toFixed(1) : 0;

        // Count cached routes
        let cachedRoutes = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(CACHE_PREFIX)) {
                cachedRoutes++;
            }
        }

        return {
            today: todayStats,
            total: {
                hits: totalHits,
                misses: totalMisses,
                saves: totalSaves,
                requests: totalRequests
            },
            hitRate: `${hitRate}%`,
            cachedRoutes,
            apiCallsSaved: totalHits, // Each cache hit = 1 API call saved
            estimatedSavings: `₹${(totalHits * 0.05).toFixed(2)}` // Rough estimate
        };
    } catch (error) {
        return { today: {}, total: {}, hitRate: '0%', cachedRoutes: 0 };
    }
};

/**
 * Clean up expired cache entries
 */
export const cleanupExpiredCache = () => {
    const maxAge = CACHE_TTL_HOURS * 60 * 60 * 1000;
    const now = Date.now();
    let cleaned = 0;

    try {
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(CACHE_PREFIX)) {
                try {
                    const cached = JSON.parse(localStorage.getItem(key));
                    if (now - cached.timestamp > maxAge) {
                        keysToRemove.push(key);
                    }
                } catch {
                    keysToRemove.push(key); // Remove corrupted entries
                }
            }
        }

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            cleaned++;
        });

        if (cleaned > 0) {
            console.log(`🧹 [CACHE CLEANUP] Removed ${cleaned} expired entries`);
        }

        return cleaned;
    } catch (error) {
        return 0;
    }
};

/**
 * Clear all flight cache (emergency cleanup)
 */
export const clearAllFlightCache = () => {
    try {
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(CACHE_PREFIX)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`🗑️ [CACHE CLEAR] Removed ${keysToRemove.length} cache entries`);

        return keysToRemove.length;
    } catch (error) {
        return 0;
    }
};

/**
 * Get list of all cached routes
 * @returns {array} - Array of cached route objects
 */
export const getCachedRoutes = () => {
    const routes = [];

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(CACHE_PREFIX)) {
                const cached = JSON.parse(localStorage.getItem(key));
                const ageHours = Math.round((Date.now() - cached.timestamp) / 3600000);
                routes.push({
                    route: `${cached.origin}→${cached.dest}`,
                    date: cached.date,
                    flights: cached.flightCount,
                    age: `${ageHours}h ago`,
                    expiresIn: `${24 - ageHours}h`
                });
            }
        }
    } catch (error) {
        console.error('Error listing cached routes:', error);
    }

    return routes;
};

export default {
    getCachedFlights,
    setCachedFlights,
    getCacheStats,
    cleanupExpiredCache,
    clearAllFlightCache,
    getCachedRoutes,
    generateCacheKey
};
