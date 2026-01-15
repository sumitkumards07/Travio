// Travelpayouts Partner Links API Integration
// Converts regular booking links to affiliate partner links

// Use proxy in development to avoid CORS
const API_URL = import.meta.env.DEV
    ? '/api/travelpayouts/links/v1/create'
    : 'https://api.travelpayouts.com/links/v1/create';

// Get credentials from environment
const getCredentials = () => ({
    token: import.meta.env.VITE_TRAVELPAYOUTS_TOKEN,
    marker: parseInt(import.meta.env.VITE_TRAVELPAYOUTS_MARKER) || 0,
    trs: parseInt(import.meta.env.VITE_TRAVELPAYOUTS_TRS) || 0
});

// Cache for converted links to avoid duplicate API calls
const linkCache = new Map();

/**
 * Convert a single URL to an affiliate partner link
 * @param {string} url - Original booking URL
 * @param {string} subId - Optional tracking sub ID
 * @returns {Promise<string>} - Partner link or original URL if conversion fails
 */
export const convertToPartnerLink = async (url, subId = '') => {
    // Check cache first
    const cacheKey = `${url}:${subId}`;
    if (linkCache.has(cacheKey)) {
        return linkCache.get(cacheKey);
    }

    const credentials = getCredentials();

    // If credentials not set, return original URL
    if (!credentials.token || !credentials.marker || !credentials.trs) {
        console.warn('Travelpayouts credentials not configured. Using direct links.');
        return url;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Token': credentials.token
            },
            body: JSON.stringify({
                trs: credentials.trs,
                marker: credentials.marker,
                shorten: true,
                links: [
                    {
                        url: url,
                        sub_id: subId
                    }
                ]
            })
        });

        const data = await response.json();

        if (data.status === 200 && data.result?.links?.[0]?.code === 'success') {
            const partnerUrl = data.result.links[0].partner_url;
            linkCache.set(cacheKey, partnerUrl);
            return partnerUrl;
        } else {
            console.warn('Failed to convert link:', data.result?.links?.[0]?.message || 'Unknown error');
            return url;
        }
    } catch (error) {
        console.error('Travelpayouts API error:', error);
        return url;
    }
};

/**
 * Convert multiple URLs to affiliate partner links
 * @param {Array<{url: string, subId?: string}>} links - Array of links to convert
 * @returns {Promise<Map<string, string>>} - Map of original URL to partner URL
 */
export const convertMultipleLinks = async (links) => {
    const credentials = getCredentials();
    const results = new Map();

    // If credentials not set, return original URLs
    if (!credentials.token || !credentials.marker || !credentials.trs) {
        console.warn('Travelpayouts credentials not configured. Using direct links.');
        links.forEach(link => results.set(link.url, link.url));
        return results;
    }

    // Filter out cached links
    const uncachedLinks = links.filter(link => {
        const cacheKey = `${link.url}:${link.subId || ''}`;
        if (linkCache.has(cacheKey)) {
            results.set(link.url, linkCache.get(cacheKey));
            return false;
        }
        return true;
    });

    if (uncachedLinks.length === 0) {
        return results;
    }

    // Split into batches of 10 (API limit)
    const batches = [];
    for (let i = 0; i < uncachedLinks.length; i += 10) {
        batches.push(uncachedLinks.slice(i, i + 10));
    }

    // Process each batch
    for (const batch of batches) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': credentials.token
                },
                body: JSON.stringify({
                    trs: credentials.trs,
                    marker: credentials.marker,
                    shorten: true,
                    links: batch.map(link => ({
                        url: link.url,
                        sub_id: link.subId || ''
                    }))
                })
            });

            const data = await response.json();

            if (data.status === 200 && data.result?.links) {
                data.result.links.forEach((result, index) => {
                    const originalUrl = batch[index].url;
                    const partnerUrl = result.code === 'success' ? result.partner_url : originalUrl;
                    const cacheKey = `${originalUrl}:${batch[index].subId || ''}`;

                    linkCache.set(cacheKey, partnerUrl);
                    results.set(originalUrl, partnerUrl);
                });
            }
        } catch (error) {
            console.error('Travelpayouts batch API error:', error);
            // Return original URLs for failed batch
            batch.forEach(link => results.set(link.url, link.url));
        }
    }

    return results;
};

/**
 * Pre-defined brand URLs that Travelpayouts supports
 */
export const SUPPORTED_BRANDS = {
    'booking.com': 'https://www.booking.com',
    'agoda': 'https://www.agoda.com',
    'trip.com': 'https://www.trip.com',
    'hotels.com': 'https://www.hotels.com',
    'hostelworld': 'https://www.hostelworld.com',
    'hotellook': 'https://www.hotellook.com',
    'aviasales': 'https://www.aviasales.com',
    'jetradar': 'https://www.jetradar.com',
    'rentalcars': 'https://www.rentalcars.com',
    'discovercars': 'https://www.discovercars.com',
    'kiwitaxi': 'https://www.kiwitaxi.com',
    'busbud': 'https://www.busbud.com',
    'omio': 'https://www.omio.com',
    'getyourguide': 'https://www.getyourguide.com',
    'klook': 'https://www.klook.com',
    'viator': 'https://www.viator.com'
};

/**
 * Check if a URL is from a supported Travelpayouts brand
 */
export const isSupportedBrand = (url) => {
    const urlLower = url.toLowerCase();
    return Object.values(SUPPORTED_BRANDS).some(brand => urlLower.includes(brand.replace('https://www.', '')));
};

/**
 * Clear the link cache (useful for testing or refreshing)
 */
export const clearLinkCache = () => {
    linkCache.clear();
};
