/**
 * Travio Data Layer
 * Uses localStorage for now. Can be swapped to Supabase later.
 */

const TDB = (() => {
    // ── Supabase config (fill in when ready) ──
    const SUPABASE_URL = '';
    const SUPABASE_ANON_KEY = '';
    const USE_SUPABASE = false; // flip to true when Supabase is connected

    let supabase = null;
    if (USE_SUPABASE && SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    // ── LocalStorage helpers ──
    function getStore(key) {
        try { return JSON.parse(localStorage.getItem(key)) || []; }
        catch { return []; }
    }
    function setStore(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
    function uuid() {
        return crypto.randomUUID ? crypto.randomUUID() : 
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
    }

    // ── HOTELS ──
    async function getHotels(filters = {}) {
        if (USE_SUPABASE && supabase) {
            let q = supabase.from('hotels').select('*').eq('is_active', true).order('created_at', { ascending: false });
            if (filters.category) q = q.eq('category', filters.category);
            // Note: For advanced text search in Supabase, we'd use .textSearch or .ilike.
            // For now, doing simple ilike on name or location if possible, 
            // but for simplicity with basic Supabase, we can filter client-side if needed.
            if (filters.query) {
                q = q.or(`name.ilike.%${filters.query}%,location.ilike.%${filters.query}%`);
            }
            const { data, error } = await q;
            if (error) throw error;
            return data;
        }
        let hotels = getStore('travio_hotels').filter(h => h.is_active);
        if (filters.category) hotels = hotels.filter(h => h.category === filters.category);
        if (filters.query) {
            const q = filters.query.toLowerCase();
            hotels = hotels.filter(h => 
                h.name.toLowerCase().includes(q) || 
                h.location.toLowerCase().includes(q)
            );
        }
        return hotels;
    }

    async function getAllHotels() {
        if (USE_SUPABASE && supabase) {
            const { data, error } = await supabase.from('hotels').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
        return getStore('travio_hotels');
    }

    async function getHotelById(id) {
        if (USE_SUPABASE && supabase) {
            const { data, error } = await supabase.from('hotels').select('*').eq('id', id).single();
            if (error) throw error;
            return data;
        }
        return getStore('travio_hotels').find(h => h.id === id) || null;
    }

    async function createHotel(hotel) {
        hotel.id = hotel.id || uuid();
        hotel.created_at = hotel.created_at || new Date().toISOString();
        hotel.is_active = hotel.is_active !== undefined ? hotel.is_active : true;

        if (USE_SUPABASE && supabase) {
            const { data, error } = await supabase.from('hotels').insert(hotel).select().single();
            if (error) throw error;
            return data;
        }
        const hotels = getStore('travio_hotels');
        hotels.unshift(hotel);
        setStore('travio_hotels', hotels);
        return hotel;
    }

    async function updateHotel(id, updates) {
        if (USE_SUPABASE && supabase) {
            const { data, error } = await supabase.from('hotels').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        }
        const hotels = getStore('travio_hotels');
        const idx = hotels.findIndex(h => h.id === id);
        if (idx === -1) throw new Error('Hotel not found');
        hotels[idx] = { ...hotels[idx], ...updates };
        setStore('travio_hotels', hotels);
        return hotels[idx];
    }

    async function deleteHotel(id) {
        if (USE_SUPABASE && supabase) {
            const { error } = await supabase.from('hotels').delete().eq('id', id);
            if (error) throw error;
            return;
        }
        const hotels = getStore('travio_hotels').filter(h => h.id !== id);
        setStore('travio_hotels', hotels);
        // Also delete associated room types
        const rooms = getStore('travio_rooms').filter(r => r.hotel_id !== id);
        setStore('travio_rooms', rooms);
    }

    // ── ROOM TYPES ──
    async function getRoomsByHotel(hotelId) {
        if (USE_SUPABASE && supabase) {
            const { data, error } = await supabase.from('room_types').select('*').eq('hotel_id', hotelId);
            if (error) throw error;
            return data;
        }
        return getStore('travio_rooms').filter(r => r.hotel_id === hotelId);
    }

    async function createRoom(room) {
        room.id = room.id || uuid();
        if (USE_SUPABASE && supabase) {
            const { data, error } = await supabase.from('room_types').insert(room).select().single();
            if (error) throw error;
            return data;
        }
        const rooms = getStore('travio_rooms');
        rooms.push(room);
        setStore('travio_rooms', rooms);
        return room;
    }

    async function updateRoom(id, updates) {
        if (USE_SUPABASE && supabase) {
            const { data, error } = await supabase.from('room_types').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        }
        const rooms = getStore('travio_rooms');
        const idx = rooms.findIndex(r => r.id === id);
        if (idx === -1) throw new Error('Room not found');
        rooms[idx] = { ...rooms[idx], ...updates };
        setStore('travio_rooms', rooms);
        return rooms[idx];
    }

    async function deleteRoom(id) {
        if (USE_SUPABASE && supabase) {
            const { error } = await supabase.from('room_types').delete().eq('id', id);
            if (error) throw error;
            return;
        }
        const rooms = getStore('travio_rooms').filter(r => r.id !== id);
        setStore('travio_rooms', rooms);
    }

    // ── ADMIN AUTH ──
    const ADMIN_PASSWORD = 'travio2024';

    function adminLogin(password) {
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('travio_admin', 'true');
            return true;
        }
        return false;
    }

    function isAdminLoggedIn() {
        return sessionStorage.getItem('travio_admin') === 'true';
    }

    function adminLogout() {
        sessionStorage.removeItem('travio_admin');
    }

    // ── IMAGE HANDLING ──
    // For localStorage mode: convert file to base64 data URL
    async function uploadImage(file) {
        if (USE_SUPABASE && supabase) {
            const fileName = `${uuid()}-${file.name}`;
            const { data, error } = await supabase.storage.from('hotel-images').upload(fileName, file);
            if (error) throw error;
            const { data: urlData } = supabase.storage.from('hotel-images').getPublicUrl(fileName);
            return urlData.publicUrl;
        }
        // localStorage mode: use base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // ── SEED DEMO DATA ──
    function seedDemoData() {
        const DB_VERSION = '1.2';
        if (localStorage.getItem('travio_db_version') !== DB_VERSION) {
            localStorage.removeItem('travio_hotels');
            localStorage.removeItem('travio_rooms');
            localStorage.setItem('travio_db_version', DB_VERSION);
        }

        const existingHotels = getStore('travio_hotels');
        const existingNames = existingHotels.map(h => h.name);

        const demoHotels = [
            {
                id: uuid(), name: 'The Byke Heritage Hotel Matheran', location: 'Matheran, Maharashtra',
                description: 'At The Byke Heritage Hotel Matheran, we offer comfortable accommodations, modern amenities, and warm hospitality in a peaceful natural setting. Our services include well-appointed rooms, dining facilities, and personalized guest support for a memorable stay.',
                rating: 4.6, price_per_night: 3599, whatsapp_number: '918930146635',
                amenities: ['WiFi', 'AC', 'Comfortable Bedding', 'Dining Facilities', 'Room Service'],
                images: [
                    'https://cdn.jsdelivr.net/gh/sumitkumards07/Travio@main/images/byke/unnamed-60.webp', 
                    'https://cdn.jsdelivr.net/gh/sumitkumards07/Travio@main/images/byke/unnamed-59.webp', 
                    'https://cdn.jsdelivr.net/gh/sumitkumards07/Travio@main/images/byke/unnamed-58.webp', 
                    'https://cdn.jsdelivr.net/gh/sumitkumards07/Travio@main/images/byke/unnamed-57.webp', 
                    'https://cdn.jsdelivr.net/gh/sumitkumards07/Travio@main/images/byke/unnamed-56.webp', 
                    'https://cdn.jsdelivr.net/gh/sumitkumards07/Travio@main/images/byke/unnamed-55.webp', 
                    'https://cdn.jsdelivr.net/gh/sumitkumards07/Travio@main/images/byke/unnamed-54.webp', 
                    'https://cdn.jsdelivr.net/gh/sumitkumards07/Travio@main/images/byke/unnamed-52.webp'
                ],
                category: 'Resort', is_active: true, created_at: new Date().toISOString()
            }
        ];

        const newHotels = demoHotels.filter(h => !existingNames.includes(h.name));
        if (newHotels.length === 0) return; // already fully seeded

        setStore('travio_hotels', [...existingHotels, ...newHotels]);

        // Seed room types for each new hotel
        const roomTemplates = [
            { name: 'Standard Room', description: 'Comfortable room with all basic amenities.', priceMult: 1, max_guests: 2, amenities: ['AC', 'TV', 'WiFi', 'Attached Bathroom'] },
            { name: 'Deluxe Room', description: 'Spacious room with premium furnishings and city/garden view.', priceMult: 1.5, max_guests: 2, amenities: ['AC', 'TV', 'WiFi', 'Mini Bar', 'City View', 'Attached Bathroom'] },
            { name: 'Suite', description: 'Luxurious suite with separate living area and premium amenities.', priceMult: 2.5, max_guests: 4, amenities: ['AC', 'TV', 'WiFi', 'Mini Bar', 'Living Room', 'Bathtub', 'Premium View'] }
        ];

        const roomImages = [
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600',
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600'
        ];

        const demoRooms = getStore('travio_rooms');
        newHotels.forEach(hotel => {
            roomTemplates.forEach((tmpl, i) => {
                demoRooms.push({
                    id: uuid(),
                    hotel_id: hotel.id,
                    name: tmpl.name,
                    description: tmpl.description,
                    price_per_night: hotel.name === 'The Byke Heritage Hotel Matheran' ? 3599 : Math.round(hotel.price_per_night * tmpl.priceMult),
                    max_guests: tmpl.max_guests,
                    image_url: roomImages[i],
                    amenities: tmpl.amenities
                });
            });
        });
        setStore('travio_rooms', demoRooms);
        console.log('Demo data seeded:', newHotels.length, 'new hotels added');
    }

    // ── CATEGORIES ──
    function getCategories() {
        return ['All', 'Luxury', 'Resort', 'Lodge', 'Budget', 'Villa', 'Boutique'];
    }

    return {
        getHotels, getAllHotels, getHotelById, createHotel, updateHotel, deleteHotel,
        getRoomsByHotel, createRoom, updateRoom, deleteRoom,
        adminLogin, isAdminLoggedIn, adminLogout,
        uploadImage, seedDemoData, getCategories
    };
})();
