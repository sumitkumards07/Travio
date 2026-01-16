// Activities & Experiences Service
// Deep links to Klook, Tiqets, TicketNetwork, Viator
// Upsell "Things to do" after flight booking

// Popular destinations with activity categories
const DESTINATION_ACTIVITIES = {
    'Goa': ['Beach', 'Water Sports', 'Nightlife', 'Cruise'],
    'Dubai': ['Desert Safari', 'Burj Khalifa', 'Shopping', 'Theme Parks'],
    'Singapore': ['Universal Studios', 'Gardens by Bay', 'Zoo', 'Marina Bay'],
    'Thailand': ['Temples', 'Beach', 'Full Moon Party', 'Elephant Sanctuary'],
    'Mumbai': ['Bollywood Tour', 'Street Food Tour', 'Gateway of India'],
    'Delhi': ['Red Fort', 'Food Tour', 'Qutub Minar', 'Agra Day Trip'],
    'Jaipur': ['Palace Tour', 'Elephant Ride', 'Cooking Class'],
    'Kerala': ['Backwaters', 'Ayurveda', 'Houseboat', 'Tea Plantation'],
    'Manali': ['River Rafting', 'Paragliding', 'Skiing', 'Rohtang Pass'],
    'Leh': ['Pangong Lake', 'Monastery Tour', 'Khardung La'],
    'Bali': ['Temple Tour', 'Rice Terraces', 'Surfing', 'Spa'],
    'Maldives': ['Snorkeling', 'Diving', 'Water Villa', 'Dolphin Cruise'],
    'Paris': ['Eiffel Tower', 'Louvre', 'River Cruise', 'Versailles'],
    'London': ['London Eye', 'Tower of London', 'Harry Potter Studio'],
    'New York': ['Statue of Liberty', 'Broadway', 'Empire State'],
};

/**
 * Generate Klook deep link
 * Best for: Asia (Thailand, Singapore, Japan, India)
 * Commission: 3-5%
 */
export const getKlookLink = (destination, activity = null) => {
    const dest = encodeURIComponent(destination);

    if (activity) {
        return `https://www.klook.com/search/?query=${encodeURIComponent(activity + ' ' + destination)}`;
    }

    return `https://www.klook.com/search/?query=${dest}`;
};

/**
 * Generate Tiqets deep link
 * Best for: Europe, USA (Museums, Art Galleries)
 * Commission: 5-8%
 */
export const getTiqetsLink = (destination, activity = null) => {
    const dest = destination.toLowerCase().replace(/\s+/g, '-');

    if (activity) {
        return `https://www.tiqets.com/en/search?q=${encodeURIComponent(activity + ' ' + destination)}`;
    }

    return `https://www.tiqets.com/en/${dest}-attractions`;
};

/**
 * Generate Viator deep link
 * Tripadvisor's activity platform
 * Commission: 8%
 */
export const getViatorLink = (destination, activity = null) => {
    const dest = destination.toLowerCase().replace(/\s+/g, '-');

    if (activity) {
        return `https://www.viator.com/searchResults/all?text=${encodeURIComponent(activity + ' ' + destination)}`;
    }

    return `https://www.viator.com/${dest}/d-all`;
};

/**
 * Generate GetYourGuide deep link
 * European focus, good for tours
 * Commission: 8%
 */
export const getGetYourGuideLink = (destination, activity = null) => {
    const dest = destination.toLowerCase().replace(/\s+/g, '-');

    if (activity) {
        return `https://www.getyourguide.com/s/?q=${encodeURIComponent(activity + ' ' + destination)}`;
    }

    return `https://www.getyourguide.com/${dest}`;
};

/**
 * Generate TicketNetwork link (Events, Concerts, Sports)
 */
export const getTicketNetworkLink = (destination) => {
    return `https://www.ticketnetwork.com/events/${encodeURIComponent(destination)}`;
};

/**
 * Activity providers configuration
 */
export const activityProviders = {
    'klook': {
        name: 'Klook',
        logo: '🎟️',
        color: '#FF5722',
        tagline: 'Best for Asia • Theme Parks, Tours',
        commission: '3-5%',
        getLink: getKlookLink,
        regions: ['Asia', 'India', 'Southeast Asia', 'Japan', 'Korea'],
        highlight: true,
        badge: '🔥 Popular in Asia'
    },
    'tiqets': {
        name: 'Tiqets',
        logo: '🏛️',
        color: '#00B4D8',
        tagline: 'Museums & Attractions • Europe/USA',
        commission: '5-8%',
        getLink: getTiqetsLink,
        regions: ['Europe', 'USA', 'UK', 'Netherlands', 'Spain'],
        highlight: false,
        badge: null
    },
    'viator': {
        name: 'Viator',
        logo: '🌍',
        color: '#00AA6C',
        tagline: 'TripAdvisor Tours • Worldwide',
        commission: '8%',
        getLink: getViatorLink,
        regions: ['Worldwide'],
        highlight: false,
        badge: '⭐ TripAdvisor'
    },
    'getyourguide': {
        name: 'GetYourGuide',
        logo: '🗺️',
        color: '#FF4F00',
        tagline: 'Tours & Experiences',
        commission: '8%',
        getLink: getGetYourGuideLink,
        regions: ['Europe', 'Worldwide'],
        highlight: false,
        badge: null
    }
};

/**
 * Get activity links for a destination
 */
export const getActivityLinks = (destination) => {
    // Determine best provider based on destination
    const isAsia = ['India', 'Thailand', 'Singapore', 'Japan', 'Korea', 'Bali', 'Vietnam', 'Malaysia',
        'Goa', 'Mumbai', 'Delhi', 'Kerala', 'Dubai', 'Maldives'].some(
            place => destination.toLowerCase().includes(place.toLowerCase())
        );

    const isEurope = ['Paris', 'London', 'Rome', 'Barcelona', 'Amsterdam', 'Berlin', 'Vienna',
        'Prague', 'Switzerland', 'Italy', 'France', 'Spain', 'Germany'].some(
            place => destination.toLowerCase().includes(place.toLowerCase())
        );

    const links = [];

    // Add Klook first for Asia
    if (isAsia) {
        links.push({
            provider: 'klook',
            ...activityProviders.klook,
            link: activityProviders.klook.getLink(destination),
            recommended: true
        });
    }

    // Add Tiqets for Europe/USA
    if (isEurope) {
        links.push({
            provider: 'tiqets',
            ...activityProviders.tiqets,
            link: activityProviders.tiqets.getLink(destination),
            recommended: true
        });
    }

    // Always add Viator (worldwide)
    links.push({
        provider: 'viator',
        ...activityProviders.viator,
        link: activityProviders.viator.getLink(destination),
        recommended: !isAsia && !isEurope
    });

    // Add GetYourGuide
    links.push({
        provider: 'getyourguide',
        ...activityProviders.getyourguide,
        link: activityProviders.getyourguide.getLink(destination),
        recommended: false
    });

    return links;
};

/**
 * Get suggested activities for a destination
 */
export const getSuggestedActivities = (destination) => {
    // Find matching destination
    for (const [dest, activities] of Object.entries(DESTINATION_ACTIVITIES)) {
        if (destination.toLowerCase().includes(dest.toLowerCase())) {
            return activities;
        }
    }

    // Default activities
    return ['City Tour', 'Local Food', 'Sightseeing', 'Day Trip'];
};

/**
 * Get activity cards with links
 */
export const getActivityCards = (destination) => {
    const activities = getSuggestedActivities(destination);
    const providers = getActivityLinks(destination);
    const mainProvider = providers.find(p => p.recommended) || providers[0];

    return activities.map(activity => ({
        name: activity,
        destination,
        link: mainProvider.getLink(destination, activity),
        provider: mainProvider.name,
        providerLogo: mainProvider.logo
    }));
};

export { DESTINATION_ACTIVITIES };
