/**
 * Travio — Admin Panel Script
 */

let uploadedImages = [];

document.addEventListener('DOMContentLoaded', () => {
    TDB.seedDemoData();

    // ── Login ──
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    if (TDB.isAdminLoggedIn()) {
        showDashboard();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pw = document.getElementById('admin-password').value;
        if (TDB.adminLogin(pw)) {
            showDashboard();
        } else {
            loginError.style.display = 'block';
            document.getElementById('admin-password').value = '';
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        TDB.adminLogout();
        loginScreen.style.display = 'flex';
        dashboard.style.display = 'none';
    });

    function showDashboard() {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'block';
        loadStats();
        loadHotelsTable();
    }

    // ── Stats ──
    async function loadStats() {
        const hotels = await TDB.getAllHotels();
        let totalRooms = 0;
        for (const h of hotels) {
            const rooms = await TDB.getRoomsByHotel(h.id);
            totalRooms += rooms.length;
        }
        const activeCount = hotels.filter(h => h.is_active).length;

        document.getElementById('stats-row').innerHTML = `
            <div class="admin-stat-card">
                <div class="label">Total Hotels</div>
                <div class="value">${hotels.length}</div>
            </div>
            <div class="admin-stat-card">
                <div class="label">Active Hotels</div>
                <div class="value">${activeCount}</div>
            </div>
            <div class="admin-stat-card">
                <div class="label">Total Rooms</div>
                <div class="value">${totalRooms}</div>
            </div>
        `;
    }

    // ── Hotels Table ──
    async function loadHotelsTable() {
        const hotels = await TDB.getAllHotels();
        const tbody = document.getElementById('hotels-tbody');

        if (hotels.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--travio-text-secondary);">No hotels yet. Click "Add Hotel" to get started.</td></tr>';
            return;
        }

        tbody.innerHTML = hotels.map(h => `
            <tr data-id="${h.id}">
                <td><img class="hotel-thumb" src="${(h.images && h.images[0]) || 'https://via.placeholder.com/56x40'}" alt="${h.name}"/></td>
                <td><strong>${h.name}</strong></td>
                <td>${h.location}</td>
                <td>${h.category || '—'}</td>
                <td>₹${(h.price_per_night || 0).toLocaleString('en-IN')}</td>
                <td>${h.rating || '—'}</td>
                <td>
                    <label class="toggle">
                        <input type="checkbox" ${h.is_active ? 'checked' : ''} onchange="toggleHotelStatus('${h.id}', this.checked)"/>
                        <span class="toggle-slider"></span>
                    </label>
                </td>
                <td>
                    <div class="actions">
                        <button class="btn btn-secondary btn-sm" onclick="editHotel('${h.id}')">Edit</button>
                        <button class="btn btn-secondary btn-sm" onclick="manageRooms('${h.id}')">Rooms</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteHotelConfirm('${h.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // ── Add Hotel Button ──
    document.getElementById('add-hotel-btn').addEventListener('click', () => {
        openModal();
    });

    // ── Save Hotel ──
    document.getElementById('save-hotel-btn').addEventListener('click', async () => {
        const id = document.getElementById('hotel-id').value;
        const name = document.getElementById('hotel-name').value.trim();
        const location = document.getElementById('hotel-location').value.trim();
        const whatsapp = document.getElementById('hotel-whatsapp').value.trim();

        if (!name || !location || !whatsapp) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        // Collect images from URL textarea + uploaded
        const imageUrls = document.getElementById('hotel-images').value
            .split('\n').map(u => u.trim()).filter(u => u);
        const allImages = [...imageUrls, ...uploadedImages];

        const hotel = {
            name,
            location,
            description: document.getElementById('hotel-desc').value.trim(),
            category: document.getElementById('hotel-category').value,
            whatsapp_number: whatsapp,
            price_per_night: parseInt(document.getElementById('hotel-price').value) || 0,
            rating: parseFloat(document.getElementById('hotel-rating').value) || 4.5,
            amenities: document.getElementById('hotel-amenities').value.split(',').map(a => a.trim()).filter(a => a),
            images: allImages.length > 0 ? allImages : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
        };

        try {
            if (id) {
                await TDB.updateHotel(id, hotel);
                showToast('Hotel updated successfully!', 'success');
            } else {
                await TDB.createHotel(hotel);
                showToast('Hotel added successfully!', 'success');
            }
            closeModal();
            loadStats();
            loadHotelsTable();
        } catch (err) {
            showToast('Error saving hotel: ' + err.message, 'error');
        }
    });

    // ── Save Room ──
    document.getElementById('save-room-btn').addEventListener('click', async () => {
        const id = document.getElementById('room-id').value;
        const hotelId = document.getElementById('room-hotel-id').value;
        const name = document.getElementById('room-name').value.trim();
        const price = parseInt(document.getElementById('room-price').value);

        if (!name || !price) {
            showToast('Please fill in room name and price.', 'error');
            return;
        }

        const room = {
            hotel_id: hotelId,
            name,
            description: document.getElementById('room-desc').value.trim(),
            price_per_night: price,
            max_guests: parseInt(document.getElementById('room-guests').value) || 2,
            amenities: document.getElementById('room-amenities').value.split(',').map(a => a.trim()).filter(a => a),
            image_url: document.getElementById('room-image').value.trim() || '',
        };

        try {
            if (id) {
                await TDB.updateRoom(id, room);
                showToast('Room updated!', 'success');
            } else {
                await TDB.createRoom(room);
                showToast('Room added!', 'success');
            }
            closeRoomModal();
            manageRooms(hotelId);
            loadStats();
        } catch (err) {
            showToast('Error saving room: ' + err.message, 'error');
        }
    });

    // ── Image Upload Zone ──
    const uploadZone = document.getElementById('image-upload-zone');
    const fileInput = document.getElementById('image-files');

    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.style.borderColor = 'var(--travio-primary)'; });
    uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = ''; });
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '';
        handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    async function handleFiles(files) {
        for (const file of files) {
            try {
                const url = await TDB.uploadImage(file);
                uploadedImages.push(url);
                renderUploadPreviews();
            } catch (err) {
                showToast('Failed to upload: ' + file.name, 'error');
            }
        }
    }

    function renderUploadPreviews() {
        const container = document.getElementById('upload-previews');
        container.innerHTML = uploadedImages.map((url, i) => `
            <div class="upload-preview">
                <img src="${url}" alt="Upload ${i + 1}"/>
                <button class="remove" onclick="removeUploadedImage(${i})">×</button>
            </div>
        `).join('');
    }

    // Make functions globally accessible
    window.loadHotelsTable = loadHotelsTable;
    window.loadStats = loadStats;
    window.renderUploadPreviews = renderUploadPreviews;
});

// ── Global Functions ──

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function openModal(hotel = null) {
    uploadedImages = [];
    const modal = document.getElementById('hotel-modal');
    const title = document.getElementById('modal-title');

    if (hotel) {
        title.textContent = 'Edit Hotel';
        document.getElementById('hotel-id').value = hotel.id;
        document.getElementById('hotel-name').value = hotel.name;
        document.getElementById('hotel-location').value = hotel.location;
        document.getElementById('hotel-desc').value = hotel.description || '';
        document.getElementById('hotel-category').value = hotel.category || 'Luxury';
        document.getElementById('hotel-whatsapp').value = hotel.whatsapp_number || '';
        document.getElementById('hotel-price').value = hotel.price_per_night || '';
        document.getElementById('hotel-rating').value = hotel.rating || '';
        document.getElementById('hotel-amenities').value = (hotel.amenities || []).join(', ');
        document.getElementById('hotel-images').value = (hotel.images || []).join('\n');
    } else {
        title.textContent = 'Add Hotel';
        document.getElementById('hotel-form').reset();
        document.getElementById('hotel-id').value = '';
    }

    document.getElementById('upload-previews').innerHTML = '';
    modal.classList.add('show');
}

function closeModal() {
    document.getElementById('hotel-modal').classList.remove('show');
    uploadedImages = [];
}

async function editHotel(id) {
    const hotel = await TDB.getHotelById(id);
    if (hotel) openModal(hotel);
}

async function toggleHotelStatus(id, active) {
    try {
        await TDB.updateHotel(id, { is_active: active });
        showToast(active ? 'Hotel activated' : 'Hotel hidden from site', 'success');
        window.loadStats();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

async function deleteHotelConfirm(id) {
    if (!confirm('Are you sure you want to delete this hotel? This will also delete all its room types.')) return;
    try {
        await TDB.deleteHotel(id);
        showToast('Hotel deleted.', 'success');
        window.loadHotelsTable();
        window.loadStats();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

function removeUploadedImage(index) {
    uploadedImages.splice(index, 1);
    window.renderUploadPreviews();
}

// ── Room Management ──
async function manageRooms(hotelId) {
    const hotel = await TDB.getHotelById(hotelId);
    const rooms = await TDB.getRoomsByHotel(hotelId);

    // Replace hotel table section temporarily with rooms view
    const content = document.querySelector('.admin-content');
    const existingRoomSection = document.getElementById('rooms-section');
    if (existingRoomSection) existingRoomSection.remove();

    const section = document.createElement('div');
    section.id = 'rooms-section';
    section.className = 'admin-section';
    section.innerHTML = `
        <div class="admin-section-header">
            <h2>Rooms — ${hotel.name}</h2>
            <div style="display:flex; gap:8px;">
                <button class="btn btn-secondary btn-sm" onclick="document.getElementById('rooms-section').remove();">← Back</button>
                <button class="btn btn-primary btn-sm" onclick="openRoomModal('${hotelId}')">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/></svg>
                    Add Room
                </button>
            </div>
        </div>
        <div style="overflow-x:auto;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Room Name</th>
                        <th>Price/Night</th>
                        <th>Max Guests</th>
                        <th>Amenities</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${rooms.length === 0 ? `
                        <tr><td colspan="6" style="text-align:center; padding:32px; color:var(--travio-text-secondary);">No rooms yet. Click "Add Room" to add one.</td></tr>
                    ` : rooms.map(r => `
                        <tr>
                            <td><img class="hotel-thumb" src="${r.image_url || 'https://via.placeholder.com/56x40'}" alt="${r.name}"/></td>
                            <td><strong>${r.name}</strong><br/><small style="color:var(--travio-text-secondary);">${r.description || ''}</small></td>
                            <td>₹${(r.price_per_night || 0).toLocaleString('en-IN')}</td>
                            <td>${r.max_guests || 2}</td>
                            <td>${(r.amenities || []).join(', ') || '—'}</td>
                            <td>
                                <div class="actions">
                                    <button class="btn btn-secondary btn-sm" onclick="editRoom('${r.id}', '${hotelId}')">Edit</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteRoomConfirm('${r.id}', '${hotelId}')">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    content.appendChild(section);
    section.scrollIntoView({ behavior: 'smooth' });
}

function openRoomModal(hotelId, room = null) {
    const modal = document.getElementById('room-modal');
    const title = document.getElementById('room-modal-title');

    if (room) {
        title.textContent = 'Edit Room Type';
        document.getElementById('room-id').value = room.id;
        document.getElementById('room-hotel-id').value = hotelId;
        document.getElementById('room-name').value = room.name;
        document.getElementById('room-price').value = room.price_per_night || '';
        document.getElementById('room-desc').value = room.description || '';
        document.getElementById('room-guests').value = room.max_guests || 2;
        document.getElementById('room-amenities').value = (room.amenities || []).join(', ');
        document.getElementById('room-image').value = room.image_url || '';
    } else {
        title.textContent = 'Add Room Type';
        document.getElementById('room-form').reset();
        document.getElementById('room-id').value = '';
        document.getElementById('room-hotel-id').value = hotelId;
    }
    modal.classList.add('show');
}

function closeRoomModal() {
    document.getElementById('room-modal').classList.remove('show');
}

async function editRoom(roomId, hotelId) {
    const rooms = await TDB.getRoomsByHotel(hotelId);
    const room = rooms.find(r => r.id === roomId);
    if (room) openRoomModal(hotelId, room);
}

async function deleteRoomConfirm(roomId, hotelId) {
    if (!confirm('Delete this room type?')) return;
    try {
        await TDB.deleteRoom(roomId);
        showToast('Room deleted.', 'success');
        manageRooms(hotelId);
        window.loadStats();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}
