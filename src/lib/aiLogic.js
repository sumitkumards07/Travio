import { mockRoutes, providers } from './mockData';

// Hub mapping: Which cities are close hubs for others?
const NEARBY_HUBS = {
    'VGA': {
        hub: 'HYD',
        hubName: 'Hyderabad',
        distanceKm: 270,
        connections: {
            cab: { price: 3000, duration: '4h', operator: 'Ola' },
            bus: { price: 650, duration: '5h 30m', operator: 'APSRTC' },
            train: { price: 450, duration: '5h', operator: 'IRCTC' }
        }
    },
    'VGA': {
        hub: 'HYD',
        hubName: 'Hyderabad',
        distanceKm: 270,
        connections: {
            cab: { price: 3000, duration: '4h', operator: 'Ola' },
            bus: { price: 650, duration: '5h 30m', operator: 'APSRTC' },
            train: { price: 450, duration: '5h', operator: 'IRCTC' }
        }
    },
    'PNQ': {
        hub: 'BOM',
        hubName: 'Mumbai',
        distanceKm: 150,
        connections: {
            cab: { price: 2600, duration: '3h', operator: 'Ola' },
            bus: { price: 450, duration: '4h', operator: 'MSRTC' },
            train: { price: 350, duration: '3h 30m', operator: 'IRCTC' }
        }
    },
    'JAI': {
        hub: 'DEL',
        hubName: 'Delhi',
        distanceKm: 280,
        connections: {
            cab: { price: 4200, duration: '5h', operator: 'Ola' },
            bus: { price: 800, duration: '6h', operator: 'RSRTC' },
            train: { price: 600, duration: '4h 30m', operator: 'IRCTC' }
        }
    },
    'GOI': {
        hub: 'BOM',
        hubName: 'Mumbai',
        distanceKm: 590,
        connections: {
            cab: { price: 8500, duration: '10h', operator: 'Ola' },
            bus: { price: 1200, duration: '12h', operator: 'KSRTC' },
            train: { price: 800, duration: '10h', operator: 'IRCTC' }
        }
    }
};

// Find AI-powered smart route suggestions
export const findAiSuggestions = async (from, to, currentBestPrice, mode = 'flight') => {
    // 1. Check if 'from' has a nearby hub
    const hubData = NEARBY_HUBS[from];
    if (!hubData) return null;

    const hubCode = hubData.hub;
    const suggestions = [];

    // 2. Find options from Hub -> Destination
    const hubOptions = mockRoutes.filter(r =>
        r.from === hubCode &&
        r.to === to &&
        r.mode === mode &&
        r.type !== 'hotel'
    );

    if (hubOptions.length === 0) return null;

    // 3. Find cheapest option from Hub
    const cheapestHubOption = hubOptions.sort((a, b) => a.price - b.price)[0];

    // 4. Calculate smart routes for each connection type
    const connectionTypes = ['bus', 'train', 'cab'];

    for (const connType of connectionTypes) {
        const connection = hubData.connections[connType];
        if (!connection) continue;

        const totalCost = cheapestHubOption.price + connection.price;
        const savings = currentBestPrice - totalCost;

        if (savings > 0) {
            suggestions.push({
                type: 'smart_route',
                connectionMode: connType,
                hub: hubCode,
                hubName: hubData.hubName,
                totalCost,
                savings,
                savingsPercent: Math.round((savings / currentBestPrice) * 100),
                mainOption: cheapestHubOption,
                connection: {
                    from: from,
                    to: hubCode,
                    mode: connType,
                    price: connection.price,
                    duration: connection.duration,
                    operator: connection.operator
                }
            });
        }
    }

    // Sort by savings (highest first)
    suggestions.sort((a, b) => b.savings - a.savings);

    // Return top suggestion or null
    return suggestions.length > 0 ? suggestions[0] : null;
};

// Get all smart route options
export const getAllSmartRoutes = async (from, to, currentBestPrice, mode = 'flight') => {
    const hubData = NEARBY_HUBS[from];
    if (!hubData) return [];

    const hubCode = hubData.hub;
    const suggestions = [];

    const hubOptions = mockRoutes.filter(r =>
        r.from === hubCode &&
        r.to === to &&
        r.mode === mode &&
        r.type !== 'hotel'
    );

    if (hubOptions.length === 0) return [];

    const cheapestHubOption = hubOptions.sort((a, b) => a.price - b.price)[0];

    for (const connType of ['bus', 'train', 'cab']) {
        const connection = hubData.connections[connType];
        if (!connection) continue;

        const totalCost = cheapestHubOption.price + connection.price;
        const savings = currentBestPrice - totalCost;

        if (savings > 0) {
            suggestions.push({
                type: 'smart_route',
                connectionMode: connType,
                hub: hubCode,
                hubName: hubData.hubName,
                totalCost,
                savings,
                savingsPercent: Math.round((savings / currentBestPrice) * 100),
                mainOption: cheapestHubOption,
                connection: {
                    from: from,
                    to: hubCode,
                    mode: connType,
                    price: connection.price,
                    duration: connection.duration,
                    operator: connection.operator
                }
            });
        }
    }

    return suggestions.sort((a, b) => b.savings - a.savings);
};

// Format duration for display
export const formatTotalDuration = (connectionDuration, mainDuration) => {
    // Parse hours from strings like "4h" or "5h 30m"
    const parseHours = (str) => {
        const match = str.match(/(\d+)h\s*(\d+)?m?/);
        if (match) {
            return parseInt(match[1]) + (parseInt(match[2] || 0) / 60);
        }
        return 0;
    };

    const total = parseHours(connectionDuration) + parseHours(mainDuration);
    const hours = Math.floor(total);
    const mins = Math.round((total - hours) * 60);

    return `${hours}h ${mins > 0 ? mins + 'm' : ''}`.trim();
};
