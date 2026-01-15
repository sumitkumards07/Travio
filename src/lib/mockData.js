// Cities with airports/stations
export const cities = [
    { id: 'DEL', name: 'Delhi', code: 'DEL', airport: 'Indira Gandhi Intl', station: 'New Delhi Railway Station' },
    { id: 'BOM', name: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Intl', station: 'Mumbai Central' },
    { id: 'HYD', name: 'Hyderabad', code: 'HYD', airport: 'Rajiv Gandhi Intl', station: 'Secunderabad Junction' },
    { id: 'BLR', name: 'Bengaluru', code: 'BLR', airport: 'Kempegowda Intl', station: 'Bangalore City Junction' },
    { id: 'VGA', name: 'Vijayawada', code: 'VGA', airport: 'Vijayawada Airport', station: 'Vijayawada Junction' },
    { id: 'MAA', name: 'Chennai', code: 'MAA', airport: 'Chennai Intl', station: 'Chennai Central' },
    { id: 'CCU', name: 'Kolkata', code: 'CCU', airport: 'Netaji Subhas Chandra Bose Intl', station: 'Howrah Junction' },
    { id: 'GOI', name: 'Goa', code: 'GOI', airport: 'Dabolim Airport', station: 'Madgaon Junction' },
    { id: 'JAI', name: 'Jaipur', code: 'JAI', airport: 'Jaipur Intl', station: 'Jaipur Junction' },
    { id: 'PNQ', name: 'Pune', code: 'PNQ', airport: 'Pune Airport', station: 'Pune Junction' },
];

// Provider info with logos and colors - now with deep link generators
export const providers = {
    // Flights - Deep links with route pre-filled
    'IndiGo': {
        type: 'flight',
        color: '#0033A0',
        logo: '✈️',
        url: 'https://www.goindigo.in',
        getDeepLink: (from, to, date) => `https://www.goindigo.in/booking/select-flight.html?origin=${from}&destination=${to}&adults=1&children=0&infants=0&departureDate=${date || new Date().toISOString().split('T')[0]}&tripType=O`
    },
    'Air India': {
        type: 'flight',
        color: '#E31837',
        logo: '✈️',
        url: 'https://www.airindia.in',
        getDeepLink: (from, to, date) => `https://www.airindia.in/book-flights.htm?origin=${from}&destination=${to}&departureDate=${date || new Date().toISOString().split('T')[0]}&adults=1`
    },
    'Vistara': {
        type: 'flight',
        color: '#4B286D',
        logo: '✈️',
        url: 'https://www.airvistara.com',
        getDeepLink: (from, to, date) => `https://www.airvistara.com/trip/book-a-trip?origin=${from}&destination=${to}&date=${date || new Date().toISOString().split('T')[0]}&pax=1`
    },
    'SpiceJet': {
        type: 'flight',
        color: '#FF5722',
        logo: '✈️',
        url: 'https://www.spicejet.com',
        getDeepLink: (from, to, date) => `https://book.spicejet.com/Search.aspx?o1=${from}&d1=${to}&dd1=${date || new Date().toISOString().split('T')[0]}&ADT=1`
    },
    'Akasa Air': {
        type: 'flight',
        color: '#FF6B00',
        logo: '✈️',
        url: 'https://www.akasaair.com',
        getDeepLink: (from, to, date) => `https://www.akasaair.com/booking/search?origin=${from}&destination=${to}&departDate=${date || new Date().toISOString().split('T')[0]}&pax=1`
    },
    // Trains
    'IRCTC': {
        type: 'train',
        color: '#FF6600',
        logo: '🚂',
        url: 'https://www.irctc.co.in',
        getDeepLink: (from, to, date) => `https://www.irctc.co.in/nget/train-search?fromStation=${from}&toStation=${to}&journeyDate=${date || new Date().toISOString().split('T')[0]}`
    },
    'ConfirmTkt': {
        type: 'train',
        color: '#2196F3',
        logo: '🚂',
        url: 'https://www.confirmtkt.com',
        getDeepLink: (from, to, date) => `https://www.confirmtkt.com/train-running-status/${from}-to-${to}`
    },
    'RailYatri': {
        type: 'train',
        color: '#4CAF50',
        logo: '🚂',
        url: 'https://www.railyatri.in',
        getDeepLink: (from, to, date) => `https://www.railyatri.in/trains/${from.toLowerCase()}-to-${to.toLowerCase()}`
    },
    // Buses
    'RedBus': {
        type: 'bus',
        color: '#D84315',
        logo: '🚌',
        url: 'https://www.redbus.in',
        getDeepLink: (from, to, date) => `https://www.redbus.in/bus-tickets/${from.toLowerCase()}-to-${to.toLowerCase()}?date=${date || new Date().toISOString().split('T')[0]}`
    },
    'AbhiBus': {
        type: 'bus',
        color: '#1565C0',
        logo: '🚌',
        url: 'https://www.abhibus.com',
        getDeepLink: (from, to, date) => `https://www.abhibus.com/bus-tickets/${from.toLowerCase()}-to-${to.toLowerCase()}`
    },
    'MakeMyTrip': {
        type: 'bus',
        color: '#F44336',
        logo: '🚌',
        url: 'https://www.makemytrip.com',
        getDeepLink: (from, to, date) => `https://www.makemytrip.com/bus-tickets/${from.toLowerCase()}-${to.toLowerCase()}-bus.html`
    },
    // Cabs
    'Uber': {
        type: 'cab',
        color: '#000000',
        logo: '🚕',
        url: 'https://www.uber.com',
        getDeepLink: (from, to) => `https://m.uber.com/ul/?action=setPickup&client_id=travio&pickup=my_location`
    },
    'Ola': {
        type: 'cab',
        color: '#4CAF50',
        logo: '🚕',
        url: 'https://www.olacabs.com',
        getDeepLink: (from, to) => `https://book.olacabs.com/?type=outcity`
    },
    'Zoomcar': {
        type: 'cab',
        color: '#00BCD4',
        logo: '🚗',
        url: 'https://www.zoomcar.com',
        getDeepLink: (from, to) => `https://www.zoomcar.com/in/self-drive-car-rentals`
    },
};


// Comprehensive route data
export const mockRoutes = [
    // ============ FLIGHTS ============
    // VGA -> DEL
    { from: 'VGA', to: 'DEL', mode: 'flight', operator: 'IndiGo', price: 8500, duration: '2h 15m', startTime: '10:00', endTime: '12:15', stops: 0, aircraft: 'A320neo' },
    { from: 'VGA', to: 'DEL', mode: 'flight', operator: 'Air India', price: 9200, duration: '2h 30m', startTime: '14:00', endTime: '16:30', stops: 0, aircraft: 'B777' },
    { from: 'VGA', to: 'DEL', mode: 'flight', operator: 'SpiceJet', price: 7800, duration: '2h 45m', startTime: '06:00', endTime: '08:45', stops: 1, aircraft: 'B737' },

    // HYD -> DEL (Cheaper Hub)
    { from: 'HYD', to: 'DEL', mode: 'flight', operator: 'Akasa Air', price: 3800, duration: '2h 10m', startTime: '18:00', endTime: '20:10', stops: 0, aircraft: 'B737 MAX', tags: ['cheapest'] },
    { from: 'HYD', to: 'DEL', mode: 'flight', operator: 'Vistara', price: 4500, duration: '2h 15m', startTime: '09:00', endTime: '11:15', stops: 0, aircraft: 'A320' },
    { from: 'HYD', to: 'DEL', mode: 'flight', operator: 'IndiGo', price: 4200, duration: '2h 05m', startTime: '07:30', endTime: '09:35', stops: 0, aircraft: 'A321neo' },
    { from: 'HYD', to: 'DEL', mode: 'flight', operator: 'Air India', price: 5100, duration: '2h 20m', startTime: '20:00', endTime: '22:20', stops: 0, aircraft: 'A350' },

    // BLR -> DEL
    { from: 'BLR', to: 'DEL', mode: 'flight', operator: 'IndiGo', price: 4800, duration: '2h 40m', startTime: '05:30', endTime: '08:10', stops: 0, aircraft: 'A320neo' },
    { from: 'BLR', to: 'DEL', mode: 'flight', operator: 'Vistara', price: 5200, duration: '2h 35m', startTime: '11:00', endTime: '13:35', stops: 0, aircraft: 'B787' },
    { from: 'BLR', to: 'DEL', mode: 'flight', operator: 'Air India', price: 5800, duration: '2h 45m', startTime: '16:30', endTime: '19:15', stops: 0, aircraft: 'A320' },

    // BOM -> DEL
    { from: 'BOM', to: 'DEL', mode: 'flight', operator: 'IndiGo', price: 3500, duration: '2h 05m', startTime: '06:00', endTime: '08:05', stops: 0, aircraft: 'A320neo' },
    { from: 'BOM', to: 'DEL', mode: 'flight', operator: 'Vistara', price: 4100, duration: '2h 10m', startTime: '09:00', endTime: '11:10', stops: 0, aircraft: 'A320' },
    { from: 'BOM', to: 'DEL', mode: 'flight', operator: 'Air India', price: 3900, duration: '2h 15m', startTime: '15:00', endTime: '17:15', stops: 0, aircraft: 'B777' },

    // MAA -> DEL
    { from: 'MAA', to: 'DEL', mode: 'flight', operator: 'IndiGo', price: 5200, duration: '2h 50m', startTime: '07:00', endTime: '09:50', stops: 0, aircraft: 'A321' },
    { from: 'MAA', to: 'DEL', mode: 'flight', operator: 'SpiceJet', price: 4800, duration: '3h 00m', startTime: '12:00', endTime: '15:00', stops: 0, aircraft: 'B737' },

    // GOI -> BOM
    { from: 'GOI', to: 'BOM', mode: 'flight', operator: 'IndiGo', price: 2800, duration: '1h 15m', startTime: '08:00', endTime: '09:15', stops: 0, aircraft: 'ATR 72' },
    { from: 'GOI', to: 'BOM', mode: 'flight', operator: 'SpiceJet', price: 2500, duration: '1h 20m', startTime: '14:00', endTime: '15:20', stops: 0, aircraft: 'Q400' },

    // ============ TRAINS ============
    // VGA -> HYD
    { from: 'VGA', to: 'HYD', mode: 'train', operator: 'IRCTC', trainName: 'Vande Bharat', trainNumber: '20717', price: 1200, duration: '4h 00m', startTime: '15:20', endTime: '19:20', class: '3A' },
    { from: 'VGA', to: 'HYD', mode: 'train', operator: 'IRCTC', trainName: 'Godavari Exp', trainNumber: '12727', price: 450, duration: '5h 30m', startTime: '06:00', endTime: '11:30', class: 'SL' },
    { from: 'VGA', to: 'HYD', mode: 'train', operator: 'ConfirmTkt', trainName: 'Vande Bharat', trainNumber: '20717', price: 1180, duration: '4h 00m', startTime: '15:20', endTime: '19:20', class: '3A' },

    // VGA -> DEL
    { from: 'VGA', to: 'DEL', mode: 'train', operator: 'IRCTC', trainName: 'AP Express', trainNumber: '12723', price: 2100, duration: '22h 30m', startTime: '14:55', endTime: '13:25 +1', class: '2A' },
    { from: 'VGA', to: 'DEL', mode: 'train', operator: 'RailYatri', trainName: 'AP Express', trainNumber: '12723', price: 2050, duration: '22h 30m', startTime: '14:55', endTime: '13:25 +1', class: '2A' },

    // HYD -> DEL
    { from: 'HYD', to: 'DEL', mode: 'train', operator: 'IRCTC', trainName: 'Telangana Exp', trainNumber: '12723', price: 1800, duration: '24h 00m', startTime: '18:25', endTime: '18:25 +1', class: '2A' },

    // BOM -> DEL
    { from: 'BOM', to: 'DEL', mode: 'train', operator: 'IRCTC', trainName: 'Rajdhani Exp', trainNumber: '12951', price: 2200, duration: '15h 35m', startTime: '16:25', endTime: '08:00 +1', class: '3A' },
    { from: 'BOM', to: 'DEL', mode: 'train', operator: 'ConfirmTkt', trainName: 'Rajdhani Exp', trainNumber: '12951', price: 2150, duration: '15h 35m', startTime: '16:25', endTime: '08:00 +1', class: '3A' },

    // BLR -> MAA
    { from: 'BLR', to: 'MAA', mode: 'train', operator: 'IRCTC', trainName: 'Shatabdi Exp', trainNumber: '12007', price: 900, duration: '5h 00m', startTime: '06:00', endTime: '11:00', class: 'CC' },

    // ============ BUSES ============
    // VGA -> HYD
    { from: 'VGA', to: 'HYD', mode: 'bus', operator: 'RedBus', busName: 'Orange Travels', busType: 'Volvo Multi-Axle', price: 800, duration: '5h 30m', startTime: '22:00', endTime: '03:30 +1' },
    { from: 'VGA', to: 'HYD', mode: 'bus', operator: 'AbhiBus', busName: 'APSRTC Garuda', busType: 'AC Sleeper', price: 650, duration: '6h 00m', startTime: '21:00', endTime: '03:00 +1' },
    { from: 'VGA', to: 'HYD', mode: 'bus', operator: 'MakeMyTrip', busName: 'Orange Travels', busType: 'Volvo Multi-Axle', price: 820, duration: '5h 30m', startTime: '22:00', endTime: '03:30 +1' },

    // HYD -> BLR
    { from: 'HYD', to: 'BLR', mode: 'bus', operator: 'RedBus', busName: 'SRS Travels', busType: 'Volvo Sleeper', price: 1200, duration: '10h 00m', startTime: '20:00', endTime: '06:00 +1' },
    { from: 'HYD', to: 'BLR', mode: 'bus', operator: 'AbhiBus', busName: 'KSRTC Airavat', busType: 'AC Sleeper', price: 1050, duration: '11h 00m', startTime: '19:00', endTime: '06:00 +1' },

    // BOM -> PNQ
    { from: 'BOM', to: 'PNQ', mode: 'bus', operator: 'RedBus', busName: 'Neeta Travels', busType: 'Volvo Multi-Axle', price: 500, duration: '3h 30m', startTime: '07:00', endTime: '10:30' },
    { from: 'BOM', to: 'PNQ', mode: 'bus', operator: 'MakeMyTrip', busName: 'MSRTC Shivneri', busType: 'AC Seater', price: 450, duration: '4h 00m', startTime: '08:00', endTime: '12:00' },

    // ============ CABS ============
    // VGA -> HYD
    { from: 'VGA', to: 'HYD', mode: 'cab', operator: 'Uber', cabType: 'Intercity Sedan', price: 3200, duration: '4h 00m', startTime: 'Anytime', distance: '270 km' },
    { from: 'VGA', to: 'HYD', mode: 'cab', operator: 'Ola', cabType: 'Outstation Prime', price: 3000, duration: '4h 00m', startTime: 'Anytime', distance: '270 km' },
    { from: 'VGA', to: 'HYD', mode: 'cab', operator: 'Zoomcar', cabType: 'Self-Drive SUV', price: 2500, duration: '4h 00m', startTime: 'Anytime', distance: '270 km', note: '24hr rental' },

    // HYD -> BLR
    { from: 'HYD', to: 'BLR', mode: 'cab', operator: 'Uber', cabType: 'Intercity Sedan', price: 7500, duration: '8h 00m', startTime: 'Anytime', distance: '570 km' },
    { from: 'HYD', to: 'BLR', mode: 'cab', operator: 'Ola', cabType: 'Outstation Prime', price: 7200, duration: '8h 00m', startTime: 'Anytime', distance: '570 km' },

    // BOM -> PNQ
    { from: 'BOM', to: 'PNQ', mode: 'cab', operator: 'Uber', cabType: 'Intercity Sedan', price: 2800, duration: '3h 00m', startTime: 'Anytime', distance: '150 km' },
    { from: 'BOM', to: 'PNQ', mode: 'cab', operator: 'Ola', cabType: 'Outstation Prime', price: 2600, duration: '3h 00m', startTime: 'Anytime', distance: '150 km' },

    // DEL -> JAI
    { from: 'DEL', to: 'JAI', mode: 'cab', operator: 'Uber', cabType: 'Intercity Sedan', price: 4500, duration: '5h 00m', startTime: 'Anytime', distance: '280 km' },
    { from: 'DEL', to: 'JAI', mode: 'cab', operator: 'Ola', cabType: 'Outstation Prime', price: 4200, duration: '5h 00m', startTime: 'Anytime', distance: '280 km' },

    // ============ HOTELS ============
    {
        id: 1, type: 'hotel', city: 'DEL',
        name: 'Pullman New Delhi Aerocity',
        price: 14500, originalPrice: 18000,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60',
        tags: ['Luxury', 'Spa', 'Pool'],
        badge: 'Smart Choice',
        location: 'Aerocity (5 mins from Airport)'
    },
    {
        id: 2, type: 'hotel', city: 'DEL',
        name: 'Ibis New Delhi Aerocity',
        price: 5500, originalPrice: 7200,
        rating: 4.2,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60',
        tags: ['Budget', 'Modern'],
        location: 'Aerocity'
    },
    {
        id: 3, type: 'hotel', city: 'BOM',
        name: 'The Taj Mahal Palace',
        price: 28000, originalPrice: 35000,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=60',
        tags: ['Heritage', 'Luxury', 'Sea View'],
        badge: 'Iconic',
        location: 'Gateway of India'
    },
];

// Search function - returns routes for given origin, destination, and mode
export const searchMockData = (from, to, mode = null) => {
    return new Promise(resolve => {
        setTimeout(() => {
            let results = mockRoutes.filter(r =>
                r.from === from &&
                r.to === to &&
                r.type !== 'hotel'
            );

            // Filter by mode if specified
            if (mode && mode !== 'all') {
                results = results.filter(r => r.mode === mode);
            }

            // Sort by price
            results.sort((a, b) => a.price - b.price);

            resolve(results);
        }, 600);
    });
};

// Get all options for a route grouped by mode
export const getGroupedResults = (from, to) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const results = mockRoutes.filter(r =>
                r.from === from &&
                r.to === to &&
                r.type !== 'hotel'
            );

            const grouped = {
                flight: results.filter(r => r.mode === 'flight').sort((a, b) => a.price - b.price),
                train: results.filter(r => r.mode === 'train').sort((a, b) => a.price - b.price),
                bus: results.filter(r => r.mode === 'bus').sort((a, b) => a.price - b.price),
                cab: results.filter(r => r.mode === 'cab').sort((a, b) => a.price - b.price),
            };

            resolve(grouped);
        }, 600);
    });
};

// Get cheapest option per mode
export const getCheapestPerMode = (from, to) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const results = mockRoutes.filter(r =>
                r.from === from &&
                r.to === to &&
                r.type !== 'hotel'
            );

            const cheapest = {};
            ['flight', 'train', 'bus', 'cab'].forEach(mode => {
                const modeResults = results.filter(r => r.mode === mode);
                if (modeResults.length > 0) {
                    cheapest[mode] = modeResults.sort((a, b) => a.price - b.price)[0];
                }
            });

            resolve(cheapest);
        }, 300);
    });
};
