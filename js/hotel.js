/**
 * Travio — Hotel Detail Page Script
 */

document.addEventListener('DOMContentLoaded', async () => {
    TDB.seedDemoData();

    const params = new URLSearchParams(window.location.search);
    const hotelId = params.get('id');
    const content = document.getElementById('detail-content');

    if (!hotelId) {
        content.innerHTML = '<div class="detail-loading">Hotel not found. <a href="index.html">Go back</a></div>';
        return;
    }

    try {
        const hotel = await TDB.getHotelById(hotelId);
        if (!hotel) {
            content.innerHTML = '<div class="detail-loading">Hotel not found. <a href="index.html">Go back</a></div>';
            return;
        }

        const rooms = await TDB.getRoomsByHotel(hotelId);

        // Update page title
        document.title = `${hotel.name} — Travio`;

        // Amenity icon map
        const amenityIcons = {
            'WiFi': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 12.55a11 11 0 0114 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>`,
            'Pool': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 20c2-1 4 1 6 0s4 1 6 0 4 1 6 0"/><path d="M2 17c2-1 4 1 6 0s4 1 6 0 4 1 6 0"/><rect x="6" y="4" width="12" height="10" rx="2"/></svg>`,
            'Spa': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
            'Restaurant': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
            'Parking': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 010 6H9"/></svg>`,
            'default': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
        };

        function getAmenityIcon(name) {
            return amenityIcons[name] || amenityIcons['default'];
        }

        // Build images for gallery
        const images = hotel.images && hotel.images.length > 0
            ? hotel.images
            : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'];

        // Fill missing gallery slots for bento grid
        while (images.length < 5) images.push(images[0]);

        // WhatsApp helper
        function getWhatsAppUrl(roomName, price) {
            let msgText = `Hi! I'd like to book the "${roomName}" at ${hotel.name}, ${hotel.location}. (₹${price.toLocaleString('en-IN')}/night).`;
            
            const checkin = params.get('checkin');
            const checkout = params.get('checkout');
            const guests = params.get('guests');
            
            if (checkin || checkout || guests) {
                msgText += '\\n\\nDetails:';
                if (checkin) msgText += `\\n- Check-in: ${checkin}`;
                if (checkout) msgText += `\\n- Check-out: ${checkout}`;
                if (guests) msgText += `\\n- Guests: ${guests}`;
            }
            
            msgText += '\\n\\nPlease let me know the availability.';
            
            const msg = encodeURIComponent(msgText);
            const num = hotel.whatsapp_number.replace(/[^0-9]/g, '');
            return `https://wa.me/${num}?text=${msg}`;
        }

        // Render
        content.innerHTML = `
<!-- Hero Section (Bento Grid) -->
<section class="py-8 px-6 md:px-16 max-w-7xl mx-auto">
    <div class="mb-6">
        <h1 class="text-3xl md:text-4xl font-display-lg text-on-surface mb-2">${hotel.name}</h1>
        <div class="flex items-center gap-2 text-on-surface-variant font-body-md flex-wrap">
            <span class="flex items-center text-[#FFD700]">
                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                <span class="ml-1 text-on-surface-variant">${hotel.rating || '4.5'}</span>
            </span>
            <span>·</span>
            <span class="font-semibold">${hotel.category || 'Guest House'}</span>
            <span>·</span>
            <span class="flex items-center"><span class="material-symbols-outlined text-sm mr-1">location_on</span> ${hotel.location}</span>
        </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[300px] md:h-[480px] rounded-2xl overflow-hidden group">
        <div class="md:col-span-2 md:row-span-2 h-full relative overflow-hidden">
            <img src="${images[0]}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div class="hidden md:block col-span-1 row-span-1 h-full relative overflow-hidden">
            <img src="${images[1]}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div class="hidden md:block col-span-1 row-span-1 h-full relative overflow-hidden">
            <img src="${images[2]}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div class="hidden md:block col-span-1 row-span-1 h-full relative overflow-hidden">
            <img src="${images[3]}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div class="hidden md:block col-span-1 row-span-1 h-full relative overflow-hidden">
            <img src="${images[4]}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
    </div>
</section>



<!-- Room Types Section (Moved UP) -->
<section class="py-12 bg-surface-container-low/30 my-8 border-y border-surface-variant">
    <div class="px-6 md:px-16 max-w-7xl mx-auto mb-10">
        <span class="font-label-md text-primary uppercase tracking-[0.2em]">Accommodation</span>
        <h3 class="font-headline-lg text-3xl mt-2 text-on-surface">Available Rooms</h3>
    </div>
    <div class="px-6 md:px-16 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        ${rooms.length > 0 ? rooms.map(room => `
        <div class="bg-surface border border-surface-variant group overflow-hidden rounded-2xl flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
            <div class="h-56 relative overflow-hidden">
                <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${room.image_url || images[0]}"/>
                <div class="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-label-md shadow-md">Up to ${room.max_guests || 2} guests</div>
            </div>
            <div class="p-6 flex-grow flex flex-col">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-headline-md text-xl text-on-surface">${room.name}</h4>
                </div>
                <div class="text-primary font-headline-md text-2xl mb-4">₹${(room.price_per_night || 0).toLocaleString('en-IN')}<span class="text-xs text-secondary font-body-md font-normal ml-1">/ night (inc. taxes & fees)</span></div>
                <ul class="space-y-2 mb-6 text-on-surface-variant font-body-md flex-grow">
                    ${(room.amenities || []).map(a => `<li class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-sm">check_circle</span> ${a}</li>`).join('')}
                </ul>
                <a href="${getWhatsAppUrl(room.name, room.price_per_night)}" target="_blank" class="w-full py-3 bg-primary text-white rounded-xl font-label-md hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                    <span class="material-symbols-outlined">chat_bubble</span>
                    Book on WhatsApp
                </a>
            </div>
        </div>
        `).join('') : `
        <div class="col-span-3 text-center py-10">
            <h3 class="text-2xl font-headline-md mb-2">No rooms listed yet</h3>
            <p class="text-on-surface-variant mb-6">Contact the hotel directly for availability.</p>
            <a href="https://wa.me/${(hotel.whatsapp_number || '').replace(/[^0-9]/g, '')}" target="_blank" class="inline-flex px-6 py-3 bg-primary text-white rounded-xl font-label-md hover:bg-primary/90 transition-all active:scale-95 items-center justify-center gap-2">
                <span class="material-symbols-outlined">chat_bubble</span>
                Contact on WhatsApp
            </a>
        </div>
        `}
    </div>
</section>

<!-- About Section -->
<section class="py-12 px-6 md:px-16 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
    <div class="space-y-6">
        <span class="font-label-md text-primary uppercase tracking-[0.2em]">About Us</span>
        <h3 class="font-headline-lg text-3xl text-on-surface leading-tight">Why Choose ${hotel.name}</h3>
        <p class="font-body-lg text-secondary leading-relaxed">
            ${hotel.description || `Experience a wonderful stay at ${hotel.name}, located in ${hotel.location}. We offer comfortable rooms, excellent service, and a memorable experience for all our guests.`}
        </p>
    </div>
    <div class="relative group">
        <div class="aspect-[4/5] rounded-2xl overflow-hidden shadow-lg p-2 bg-white border border-surface-variant">
            <img class="w-full h-full object-cover rounded-xl" src="${images[1] || images[0]}"/>
        </div>
    </div>
</section>

<!-- Facilities (Detailed) -->
<section class="py-12 px-6 md:px-16 max-w-7xl mx-auto">
    <div class="text-center mb-10">
        <span class="font-label-md text-primary uppercase tracking-[0.2em]">Features</span>
        <h3 class="font-headline-lg text-3xl mt-2 text-on-surface">Facilities at ${hotel.name}</h3>
        <p class="text-on-surface-variant mt-4 font-body-lg max-w-2xl mx-auto">Designed to provide a peaceful and convenient experience for every guest.</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        ${(hotel.amenities || []).map(a => `
        <div class="bg-surface border border-surface-variant p-6 flex flex-col items-center text-center gap-4 group hover:bg-primary-container/10 transition-colors rounded-2xl shadow-sm">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-transform duration-500 group-hover:scale-110">
                <div class="w-6 h-6">${getAmenityIcon(a)}</div>
            </div>
            <div>
                <h5 class="font-label-md text-base text-on-surface">${a}</h5>
            </div>
        </div>
        `).join('')}
    </div>
</section>



<!-- Additional Info: Tips, FAQ, Reach -->
<section class="py-12 px-6 md:px-16 max-w-7xl mx-auto grid lg:grid-cols-3 gap-6 mb-16">
    <div class="bg-surface border border-surface-variant p-8 rounded-2xl shadow-sm">
        <h4 class="font-headline-md text-xl mb-4 text-primary">Seasonal Tips</h4>
        <p class="text-on-surface-variant font-body-md">During peak seasons and holidays, rooms fill quickly. We recommend early hotel booking through our website to ensure a comfortable stay without last-minute stress.</p>
    </div>
    <div class="bg-surface border border-surface-variant p-8 rounded-2xl shadow-sm">
        <h4 class="font-headline-md text-xl mb-4 text-primary">FAQ</h4>
        <div class="space-y-4 text-on-surface-variant font-body-md">
            <details class="group border-b border-surface-variant pb-2 cursor-pointer">
                <summary class="flex justify-between items-center font-medium list-none outline-none">
                    <span>How can I book rooms?</span>
                    <span class="transition group-open:rotate-180">
                        <svg fill="none" height="20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                </summary>
                <p class="text-secondary mt-3 leading-relaxed">You can easily book online directly through our website or by clicking the "Book on WhatsApp" button for quick assistance.</p>
            </details>
            <details class="group border-b border-surface-variant pb-2 cursor-pointer">
                <summary class="flex justify-between items-center font-medium list-none outline-none">
                    <span>Do you provide family rooms?</span>
                    <span class="transition group-open:rotate-180">
                        <svg fill="none" height="20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                </summary>
                <p class="text-secondary mt-3 leading-relaxed">Yes, we offer spacious and comfortable rooms that are perfect for families, senior citizens, and groups.</p>
            </details>
            <details class="group border-b border-surface-variant pb-2 cursor-pointer">
                <summary class="flex justify-between items-center font-medium list-none outline-none">
                    <span>What are check-in/check-out timings?</span>
                    <span class="transition group-open:rotate-180">
                        <svg fill="none" height="20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                </summary>
                <p class="text-secondary mt-3 leading-relaxed">Standard check-in is at 12:00 PM and check-out is at 11:00 AM. Early check-in or late check-out is subject to availability.</p>
            </details>
        </div>
    </div>
    <div class="bg-surface border border-surface-variant p-8 rounded-2xl shadow-sm">
        <h4 class="font-headline-md text-xl mb-4 text-primary">Location</h4>
        <div class="text-on-surface-variant font-body-md">
            <div class="flex gap-3 items-start">
                <span class="material-symbols-outlined text-primary mt-1">pin_drop</span>
                <div>
                    <strong>${hotel.name}</strong><br/>
                    ${hotel.location}
                </div>
            </div>
            <div class="mt-6">
                <a href="https://maps.google.com/?q=${encodeURIComponent(hotel.name + ' ' + hotel.location)}" target="_blank" class="text-primary font-medium hover:underline flex items-center gap-1">
                    Open in Google Maps <span class="material-symbols-outlined text-sm">open_in_new</span>
                </a>
            </div>
        </div>
    </div>
</section>
        `;
    } catch (err) {
        console.error('Error loading hotel:', err);
        content.innerHTML = '<div class="detail-loading">Error loading hotel details. <a href="index.html">Go back</a></div>';
    }
});
