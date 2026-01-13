export const cities = [
    { id: 'DEL', name: 'Delhi', code: 'DEL', airport: 'Indira Gandhi Intl' },
    { id: 'BOM', name: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Intl' },
    { id: 'HYD', name: 'Hyderabad', code: 'HYD', airport: 'Rajiv Gandhi Intl' },
    { id: 'BLR', name: 'Bengaluru', code: 'BLR', airport: 'Kempegowda Intl' },
    { id: 'VGA', name: 'Vijayawada', code: 'VGA', airport: 'Vijayawada Airport' },
    { id: 'MAA', name: 'Chennai', code: 'MAA', airport: 'Chennai Intl' },
];

export const mockRoutes = [
    // VGA -> DEL (Direct & Expensive)
    { from: 'VGA', to: 'DEL', mode: 'flight', operator: 'IndiGo', price: 8500, duration: '2h 15m', startTime: '10:00', endTime: '12:15', link: 'https://www.goindigo.in' },
    { from: 'VGA', to: 'DEL', mode: 'flight', operator: 'Air India', price: 9200, duration: '2h 30m', startTime: '14:00', endTime: '16:30', link: 'https://www.airindia.in' },

    // HYD -> DEL (Cheaper Hub)
    { from: 'HYD', to: 'DEL', mode: 'flight', operator: 'Akasa Air', price: 3800, duration: '2h 10m', startTime: '18:00', endTime: '20:10', link: 'https://www.akasaair.com', tags: ['cheapest'] },
    { from: 'HYD', to: 'DEL', mode: 'flight', operator: 'Vistara', price: 4500, duration: '2h 15m', startTime: '09:00', endTime: '11:15', link: 'https://www.airvistara.com' },

    // VGA -> HYD (Connector)
    { from: 'VGA', to: 'HYD', mode: 'cab', operator: 'Uber Intercity', price: 3200, duration: '4h 00m', startTime: 'Anytime', link: 'https://www.uber.com' },
    { from: 'VGA', to: 'HYD', mode: 'bus', operator: 'Orange Travels', price: 800, duration: '5h 30m', startTime: '22:00', endTime: '03:30', link: 'https://www.redbus.in' },
    { from: 'VGA', to: 'HYD', mode: 'train', operator: 'Vande Bharat', price: 1200, duration: '4h 00m', startTime: '15:20', endTime: '19:20', link: 'https://www.irctc.co.in' },

    // DEL Stays
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
    }
];

export const searchMockData = (from, to) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockRoutes.filter(r => r.from === from && r.to === to && r.mode !== 'cab' && r.mode !== 'bus'));
        }, 600);
    });
};
