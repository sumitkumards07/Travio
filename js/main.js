/**
 * Travio — Homepage Script
 * Renders hotel cards from the data layer and handles interactivity.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Seed demo data on first visit
    TDB.seedDemoData();

    // ── Profile Menu Toggle ──
    const profileBtn = document.querySelector('[data-testid="cypress-headernav-profile"]');
    const profileDropdown = document.querySelector('[data-testid="guest-header-dropdownmenu"]');
    
    if (profileBtn && profileDropdown) {
        profileDropdown.style.display = 'none';
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            profileDropdown.style.display = profileDropdown.style.display === 'none' ? 'block' : 'none';
        });
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.style.display = 'none';
            }
        });
    }

    // ── Video Icons Hover Animation ──
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        const parentBtn = video.closest('a') || video.closest('button') || video.closest('[role="tab"]');
        if (parentBtn) {
            parentBtn.addEventListener('mouseenter', () => {
                video.currentTime = 0;
                video.play().catch(() => {});
            });
        }
        if (parentBtn && parentBtn.getAttribute('aria-selected') === 'true') {
            setTimeout(() => { video.play().catch(() => {}); }, 500);
        }
    });

    // ── Search Bar Logic ──
    const searchInput = document.getElementById('bigsearch-query-location-input');
    const searchBtn = document.querySelector('[data-testid="structured-search-input-search-button"]');
    const searchForm = document.querySelector('form[role="search"]');
    
    function handleSearch() {
        if (searchInput) {
            const query = searchInput.value.trim();
            loadHotels(null, query);
        }
    }

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSearch();
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleSearch();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }

    // ── Render Hotel Cards ──
    function createHotelCard(hotel) {
        const card = document.createElement('a');
        card.className = 'travio-card';
        const slug = hotel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        card.href = `hotel.html?hotel=${slug}`;
        
        // Intercept click to append current dates and guests
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const url = new URL(card.href, window.location.origin);
            
            const checkin = document.getElementById('search-checkin');
            const checkout = document.getElementById('search-checkout');
            const guests = document.getElementById('search-guests');
            
            if (checkin && checkin.value) url.searchParams.set('checkin', checkin.value);
            if (checkout && checkout.value) url.searchParams.set('checkout', checkout.value);
            if (guests && guests.value) url.searchParams.set('guests', guests.value);
            
            window.location.href = url.toString();
        });

        const images = hotel.images && hotel.images.length > 0
            ? hotel.images
            : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'];

        card.innerHTML = `
            <div class="travio-card-img-wrap">
                <img src="${images[0]}" alt="${hotel.name}" loading="lazy" data-images='${JSON.stringify(images)}' data-index="0"/>
                <span class="travio-card-badge">${hotel.category || 'Hotel'}</span>
                <button class="travio-card-favorite" onclick="event.preventDefault(); event.stopPropagation();">
                    <svg viewBox="0 0 32 32"><path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 00-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05A6.98 6.98 0 009 4a6.98 6.98 0 00-7 7c0 7 7 12.27 14 17z"></path></svg>
                </button>
                ${images.length > 1 ? `
                    <button class="travio-card-arrow left" onclick="event.preventDefault(); event.stopPropagation(); slideCardImage(this, -1);">
                        <svg viewBox="0 0 16 16"><path d="M10 2L4 8l6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="travio-card-arrow right" onclick="event.preventDefault(); event.stopPropagation(); slideCardImage(this, 1);">
                        <svg viewBox="0 0 16 16"><path d="M6 2l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <div class="travio-card-dots">
                        ${images.map((_, i) => `<span class="travio-card-dot${i === 0 ? ' active' : ''}"></span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="travio-card-info">
                <div class="travio-card-header">
                    <h3 class="travio-card-title">${hotel.name}</h3>
                    <span class="travio-card-rating">
                        <svg viewBox="0 0 12 12"><path d="M6 0l1.76 3.77L12 4.24 8.88 7.18l.74 4.56L6 9.75 2.38 11.74l.74-4.56L0 4.24l4.24-.47z"/></svg>
                        ${hotel.rating || '4.5'}
                    </span>
                </div>
                <p class="travio-card-location">${hotel.location}</p>
                <p class="travio-card-price"><strong>from ₹${(hotel.price_per_night || 0).toLocaleString('en-IN')}</strong> <span style="font-size: 0.75rem;">/ night (inc. taxes & fees)</span></p>
            </div>
        `;
        return card;
    }

    // ── Slide Card Images ──
    window.slideCardImage = function(arrowBtn, direction) {
        const wrap = arrowBtn.closest('.travio-card-img-wrap');
        const img = wrap.querySelector('img');
        const images = JSON.parse(img.dataset.images);
        let idx = parseInt(img.dataset.index) + direction;
        if (idx < 0) idx = images.length - 1;
        if (idx >= images.length) idx = 0;
        img.src = images[idx];
        img.dataset.index = idx;

        // Update dots
        const dots = wrap.querySelectorAll('.travio-card-dot');
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    };

    // ── Load Hotels ──
    async function loadHotels(category = null, query = null) {
        const grid = document.getElementById('hotel-grid');
        if (!grid) return;

        grid.innerHTML = '<div class="travio-empty"><p>Loading hotels...</p></div>';

        try {
            const filters = {};
            if (category) filters.category = category;
            if (query) filters.query = query;
            
            const hotels = await TDB.getHotels(filters);

            grid.innerHTML = '';

            if (hotels.length === 0) {
                grid.innerHTML = `
                    <div class="travio-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        <h3>No hotels found</h3>
                        <p>Try a different category or check back later.</p>
                    </div>
                `;
                return;
            }

            hotels.forEach(hotel => {
                grid.appendChild(createHotelCard(hotel));
            });
        } catch (err) {
            console.error('Error loading hotels:', err);
            grid.innerHTML = '<div class="travio-empty"><h3>Something went wrong</h3><p>Could not load hotels. Please refresh the page.</p></div>';
        }
    }

    // ── Initialize ──
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('query');
    
    if (initialQuery && searchInput) {
        searchInput.value = initialQuery;
        loadHotels(null, initialQuery);
    } else {
        loadHotels();
    }
});
