import { mockRoutes } from './mockData';

// Hub mapping: Which cities are close hubs for others?
const NEARBY_HUBS = {
    'VGA': { hub: 'HYD', distanceKm: 270, cabCost: 3200, busCost: 800, trainCost: 450, timeHours: 4 }
};

export const findAiSuggestions = async (from, to, currentBestPrice) => {
    // 1. Check if 'from' has a nearby hub
    const hubData = NEARBY_HUBS[from];
    if (!hubData) return null;

    const hubCode = hubData.hub;

    // 2. Find flights from Hub -> Destination
    const hubFlights = mockRoutes.filter(r => r.from === hubCode && r.to === to && r.mode === 'flight');
    if (hubFlights.length === 0) return null;

    // 3. Find cheapest flight from Hub
    const cheapestHubFlight = hubFlights.sort((a, b) => a.price - b.price)[0];

    // 4. Calculate Total Costs
    const costWithCab = cheapestHubFlight.price + hubData.cabCost;
    const costWithBus = cheapestHubFlight.price + hubData.busCost;

    // 5. Compare with Current Best Direct Price
    if (costWithCab < currentBestPrice || costWithBus < currentBestPrice) {
        return {
            type: 'smart_route',
            hub: hubCode,
            savings: currentBestPrice - (costWithBus + 100), // Approximate max savings
            routes: {
                flight: cheapestHubFlight,
                connection: {
                    from: from,
                    to: hubCode,
                    cabPrice: hubData.cabCost,
                    busPrice: hubData.busCost,
                    trainPrice: hubData.trainCost,
                    duration: hubData.timeHours
                }
            }
        };
    }

    return null;
};
