/**
 * FlixBus Real ID Fetcher
 * Fetches actual UUIDs from FlixBus autocomplete API
 * Run: node scripts/fetchFlixbusIds.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target cities for FlixBus India
const TARGET_CITIES = [
    // North India - Delhi NCR
    'Delhi', 'New Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad',

    // Rajasthan
    'Jaipur', 'Agra', 'Udaipur', 'Jodhpur', 'Ajmer', 'Pushkar',

    // UP
    'Lucknow', 'Varanasi', 'Ayodhya', 'Prayagraj', 'Kanpur', 'Mathura',

    // Uttarakhand
    'Rishikesh', 'Haridwar', 'Dehradun', 'Mussoorie', 'Nainital',

    // Himachal
    'Shimla', 'Manali', 'Dharamshala', 'Kasol', 'Kullu', 'McLeodganj',

    // Punjab
    'Chandigarh', 'Amritsar', 'Ludhiana',

    // South India
    'Bengaluru', 'Bangalore', 'Hyderabad', 'Chennai', 'Coimbatore',
    'Mysore', 'Mangalore', 'Kochi', 'Thiruvananthapuram',

    // West India  
    'Mumbai', 'Pune', 'Ahmedabad', 'Surat', 'Goa',

    // East India
    'Kolkata', 'Bhubaneswar', 'Patna', 'Guwahati'
];

async function fetchFlixBusId(cityName) {
    const url = `https://global.api.flixbus.com/search/service/v1/search-suggest?q=${encodeURIComponent(cityName)}&limit=3&lang=en&country=in`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.log(`❌ API error for ${cityName}: ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data && data.length > 0) {
            // Find best match (prefer city over station)
            const match = data.find(d => d.type === 'city') || data[0];
            return {
                name: match.name,
                uuid: match.uuid,
                type: match.type
            };
        }
        return null;
    } catch (error) {
        console.log(`❌ Error fetching ${cityName}: ${error.message}`);
        return null;
    }
}

async function main() {
    console.log('🔍 Fetching Real FlixBus UUIDs from API...\n');

    const cityMap = {};
    const failed = [];

    for (const city of TARGET_CITIES) {
        const result = await fetchFlixBusId(city);

        if (result) {
            cityMap[city] = result.uuid;
            console.log(`✅ ${city} -> ${result.uuid.substring(0, 8)}... (${result.name})`);
        } else {
            failed.push(city);
            console.log(`❌ ${city} -> NOT FOUND`);
        }

        // Rate limit: wait 200ms between requests
        await new Promise(r => setTimeout(r, 200));
    }

    // Save to JSON file
    const outputPath = path.join(__dirname, '..', 'src', 'lib', 'flixbus_real_ids.json');
    fs.writeFileSync(outputPath, JSON.stringify(cityMap, null, 2));

    console.log('\n=================================');
    console.log(`✅ Found: ${Object.keys(cityMap).length} cities`);
    console.log(`❌ Failed: ${failed.length} cities`);
    if (failed.length > 0) {
        console.log(`   Missing: ${failed.join(', ')}`);
    }
    console.log(`\n📁 Saved to: ${outputPath}`);
    console.log('=================================\n');

    // Generate JavaScript export
    const jsOutput = `// Auto-generated FlixBus UUIDs - Run: node scripts/fetchFlixbusIds.js
// Generated: ${new Date().toISOString()}
// FlixBus uses UUIDs (32-char) for their city IDs, not simple numbers

export const FLIXBUS_UUIDS = ${JSON.stringify(cityMap, null, 2)};

// Alias mapping for IATA codes and alternate names
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

// Get UUID for a city (supports aliases)
export const getFlixBusUUID = (city) => {
    const normalizedCity = CITY_ALIASES[city] || city;
    return FLIXBUS_UUIDS[normalizedCity] || null;
};
`;

    const jsPath = path.join(__dirname, '..', 'src', 'lib', 'flixbusIds.js');
    fs.writeFileSync(jsPath, jsOutput);
    console.log(`📁 Also saved as JS module: ${jsPath}`);
}

main().catch(console.error);
