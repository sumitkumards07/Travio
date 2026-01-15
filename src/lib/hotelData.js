// Hotel data structured like Travelpayouts API response
// This makes it easy to swap mock data with real API later

export const hotelProviders = {
    'booking': {
        name: 'Booking.com',
        color: '#003580',
        logo: '🏨',
        searchUrl: (city, hotel) => `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel + ' ' + city)}`
    },
    'agoda': {
        name: 'Agoda',
        color: '#5392F9',
        logo: '🌐',
        searchUrl: (city, hotel) => `https://www.agoda.com/search?city=${encodeURIComponent(city)}&textToSearch=${encodeURIComponent(hotel)}`
    },
    'goibibo': {
        name: 'Goibibo',
        color: '#EC5B24',
        logo: '🧳',
        searchUrl: (city, hotel) => `https://www.goibibo.com/hotels/search/?city=${encodeURIComponent(city)}&q=${encodeURIComponent(hotel)}`
    },
    'makemytrip': {
        name: 'MakeMyTrip',
        color: '#F44336',
        logo: '✈️',
        searchUrl: (city, hotel) => `https://www.makemytrip.com/hotels/hotel-search?city=${encodeURIComponent(city)}&searchText=${encodeURIComponent(hotel)}`
    },
    'expedia': {
        name: 'Expedia',
        color: '#F5B818',
        logo: '🌍',
        searchUrl: (city, hotel) => `https://www.expedia.co.in/Hotel-Search?destination=${encodeURIComponent(hotel + ', ' + city)}`
    },
    'tripadvisor': {
        name: 'TripAdvisor',
        color: '#00AF87',
        logo: '🦉',
        searchUrl: (city, hotel) => `https://www.tripadvisor.in/Search?q=${encodeURIComponent(hotel + ' ' + city)}`
    }
};

// Mock hotels with multi-provider prices (Travelpayouts-style structure)
export const hotels = [
    {
        id: 'taj-mumbai',
        name: 'The Taj Mahal Palace',
        city: 'Mumbai',
        cityCode: 'BOM',
        location: 'Gateway of India, Colaba',
        lat: 18.9217,
        lon: 72.8332,
        rating: 4.9,
        reviews: 12450,
        stars: 5,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60',
        amenities: ['Pool', 'Spa', 'Sea View', 'Fine Dining', 'Heritage'],
        prices: [
            { provider: 'booking', price: 28500, originalPrice: 35000 },
            { provider: 'agoda', price: 26800, originalPrice: 33000 },
            { provider: 'makemytrip', price: 27200, originalPrice: 34000 },
            { provider: 'goibibo', price: 27500, originalPrice: 33500 },
            { provider: 'expedia', price: 29000, originalPrice: 36000 },
        ],
        badge: 'Iconic Luxury'
    },
    {
        id: 'pullman-delhi',
        name: 'Pullman New Delhi Aerocity',
        city: 'Delhi',
        cityCode: 'DEL',
        location: 'Aerocity, 5 mins from Airport',
        lat: 28.5526,
        lon: 77.1071,
        rating: 4.7,
        reviews: 8234,
        stars: 5,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60',
        amenities: ['Pool', 'Spa', 'Airport Shuttle', 'Gym', 'Business Center'],
        prices: [
            { provider: 'booking', price: 14500, originalPrice: 18000 },
            { provider: 'agoda', price: 13200, originalPrice: 17000 },
            { provider: 'makemytrip', price: 13800, originalPrice: 17500 },
            { provider: 'goibibo', price: 14000, originalPrice: 17800 },
        ],
        badge: 'Smart Choice'
    },
    {
        id: 'ibis-delhi',
        name: 'ibis New Delhi Aerocity',
        city: 'Delhi',
        cityCode: 'DEL',
        location: 'Aerocity',
        lat: 28.5534,
        lon: 77.1065,
        rating: 4.2,
        reviews: 5621,
        stars: 3,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=60',
        amenities: ['WiFi', 'Restaurant', 'Airport Shuttle'],
        prices: [
            { provider: 'booking', price: 5500, originalPrice: 7200 },
            { provider: 'agoda', price: 4800, originalPrice: 6500 },
            { provider: 'makemytrip', price: 5200, originalPrice: 6800 },
            { provider: 'goibibo', price: 5100, originalPrice: 6600 },
        ],
        badge: 'Budget Friendly'
    },
    {
        id: 'leela-blr',
        name: 'The Leela Palace Bangalore',
        city: 'Bengaluru',
        cityCode: 'BLR',
        location: 'Old Airport Road',
        lat: 12.9596,
        lon: 77.6495,
        rating: 4.8,
        reviews: 6789,
        stars: 5,
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=60',
        amenities: ['Pool', 'Spa', 'Fine Dining', 'Garden', 'Concierge'],
        prices: [
            { provider: 'booking', price: 22000, originalPrice: 28000 },
            { provider: 'agoda', price: 19500, originalPrice: 25000 },
            { provider: 'makemytrip', price: 20500, originalPrice: 26000 },
            { provider: 'expedia', price: 21000, originalPrice: 27000 },
        ],
        badge: 'Royal Experience'
    },
    {
        id: 'itc-hyd',
        name: 'ITC Kohenur, Hyderabad',
        city: 'Hyderabad',
        cityCode: 'HYD',
        location: 'HITEC City',
        lat: 17.4262,
        lon: 78.3473,
        rating: 4.9,
        reviews: 4532,
        stars: 5,
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop&q=60',
        amenities: ['Pool', 'Spa', 'Rooftop Bar', 'Gym', 'Lake View'],
        prices: [
            { provider: 'booking', price: 18500, originalPrice: 23000 },
            { provider: 'agoda', price: 16800, originalPrice: 21000 },
            { provider: 'makemytrip', price: 17200, originalPrice: 22000 },
            { provider: 'goibibo', price: 17500, originalPrice: 21500 },
        ],
        badge: 'Best in City'
    },
    {
        id: 'goa-beach',
        name: 'Taj Exotica Resort & Spa',
        city: 'Goa',
        cityCode: 'GOI',
        location: 'Benaulim Beach',
        lat: 15.2665,
        lon: 73.9174,
        rating: 4.8,
        reviews: 7821,
        stars: 5,
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=60',
        amenities: ['Beach', 'Pool', 'Spa', 'Golf', 'Water Sports'],
        prices: [
            { provider: 'booking', price: 32000, originalPrice: 40000 },
            { provider: 'agoda', price: 28500, originalPrice: 36000 },
            { provider: 'makemytrip', price: 29500, originalPrice: 37000 },
            { provider: 'goibibo', price: 30000, originalPrice: 38000 },
        ],
        badge: 'Beach Paradise'
    },
    {
        id: 'chennai-itc',
        name: 'ITC Grand Chola',
        city: 'Chennai',
        cityCode: 'MAA',
        location: 'Guindy',
        lat: 13.0107,
        lon: 80.2129,
        rating: 4.7,
        reviews: 5432,
        stars: 5,
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop&q=60',
        amenities: ['Pool', 'Spa', 'Fine Dining', 'Business Center'],
        prices: [
            { provider: 'booking', price: 15500, originalPrice: 19000 },
            { provider: 'agoda', price: 13800, originalPrice: 17500 },
            { provider: 'makemytrip', price: 14200, originalPrice: 18000 },
        ],
    },
    {
        id: 'jaipur-oberoi',
        name: 'The Oberoi Rajvilas',
        city: 'Jaipur',
        cityCode: 'JAI',
        location: 'Goner Road',
        lat: 26.8572,
        lon: 75.8261,
        rating: 4.9,
        reviews: 3456,
        stars: 5,
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=60',
        amenities: ['Pool', 'Spa', 'Heritage', 'Fine Dining', 'Garden'],
        prices: [
            { provider: 'booking', price: 45000, originalPrice: 55000 },
            { provider: 'agoda', price: 42000, originalPrice: 52000 },
            { provider: 'makemytrip', price: 43500, originalPrice: 53000 },
        ],
        badge: 'Heritage Luxury'
    }
];

// Search hotels for a city
export const searchHotels = (cityCode) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const results = hotels.filter(h => h.cityCode === cityCode);
            resolve(results);
        }, 500);
    });
};

// Get cheapest price for a hotel
export const getCheapestPrice = (hotel) => {
    if (!hotel.prices || hotel.prices.length === 0) return null;
    return hotel.prices.reduce((min, p) => p.price < min.price ? p : min);
};

// Get all hotels with cheapest price highlighted
export const getHotelsWithBestPrices = (cityCode) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const results = hotels
                .filter(h => h.cityCode === cityCode)
                .map(hotel => ({
                    ...hotel,
                    cheapestPrice: getCheapestPrice(hotel),
                    savings: hotel.prices && hotel.prices.length > 0
                        ? Math.max(...hotel.prices.map(p => p.originalPrice)) - getCheapestPrice(hotel).price
                        : 0
                }))
                .sort((a, b) => a.cheapestPrice?.price - b.cheapestPrice?.price);
            resolve(results);
        }, 500);
    });
};

// Generate deep links for all providers
export const getProviderDeepLinks = (hotel) => {
    return hotel.prices.map(p => ({
        ...p,
        providerInfo: hotelProviders[p.provider],
        deepLink: hotelProviders[p.provider]?.searchUrl(hotel.city, hotel.name)
    }));
};
