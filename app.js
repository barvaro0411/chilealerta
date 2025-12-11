// ===== ChileAlerta - Main Application =====

// ===== Configuration =====
const CONFIG = {
    map: {
        center: [-33.4489, -70.6693], // Santiago
        zoom: 11,
        minZoom: 4,
        maxZoom: 18
    },
    tileLayer: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
    }
};

// ===== Air Quality Index Colors =====
const ICA_COLORS = {
    good: '#00e676',
    moderate: '#ffeb3b',
    unhealthySensitive: '#ff9800',
    unhealthy: '#f44336',
    veryUnhealthy: '#9c27b0',
    hazardous: '#5d4037'
};

// ===== Get ICA Color and Status =====
function getICAInfo(ica) {
    if (ica <= 50) return { color: ICA_COLORS.good, status: 'Bueno', level: 'good' };
    if (ica <= 100) return { color: ICA_COLORS.moderate, status: 'Moderado', level: 'moderate' };
    if (ica <= 150) return { color: ICA_COLORS.unhealthySensitive, status: 'Dañino para sensibles', level: 'unhealthySensitive' };
    if (ica <= 200) return { color: ICA_COLORS.unhealthy, status: 'Dañino', level: 'unhealthy' };
    if (ica <= 300) return { color: ICA_COLORS.veryUnhealthy, status: 'Muy dañino', level: 'veryUnhealthy' };
    return { color: ICA_COLORS.hazardous, status: 'Peligroso', level: 'hazardous' };
}

// ===== Simulated Air Quality Stations (Real SINCA stations) =====
const STATIONS = [
    { id: 1, name: 'Pudahuel', location: 'RM - Pudahuel', lat: -33.4378, lng: -70.7506, pm25: 28, pm10: 45, o3: 35, no2: 22 },
    { id: 2, name: 'Cerrillos', location: 'RM - Cerrillos', lat: -33.4975, lng: -70.7119, pm25: 32, pm10: 52, o3: 28, no2: 25 },
    { id: 3, name: 'Cerro Navia', location: 'RM - Cerro Navia', lat: -33.4250, lng: -70.7328, pm25: 45, pm10: 68, o3: 22, no2: 35 },
    { id: 4, name: 'El Bosque', location: 'RM - El Bosque', lat: -33.5567, lng: -70.6744, pm25: 38, pm10: 55, o3: 30, no2: 28 },
    { id: 5, name: 'Independencia', location: 'RM - Independencia', lat: -33.4178, lng: -70.6575, pm25: 42, pm10: 62, o3: 25, no2: 38 },
    { id: 6, name: 'La Florida', location: 'RM - La Florida', lat: -33.5228, lng: -70.5883, pm25: 35, pm10: 48, o3: 32, no2: 24 },
    { id: 7, name: 'Las Condes', location: 'RM - Las Condes', lat: -33.4103, lng: -70.5231, pm25: 18, pm10: 28, o3: 42, no2: 15 },
    { id: 8, name: 'Parque O\'Higgins', location: 'RM - Santiago Centro', lat: -33.4656, lng: -70.6603, pm25: 40, pm10: 58, o3: 28, no2: 32 },
    { id: 9, name: 'Puente Alto', location: 'RM - Puente Alto', lat: -33.6117, lng: -70.5756, pm25: 48, pm10: 72, o3: 20, no2: 40 },
    { id: 10, name: 'Quilicura', location: 'RM - Quilicura', lat: -33.3644, lng: -70.7244, pm25: 52, pm10: 78, o3: 18, no2: 42 },
    { id: 11, name: 'Concepción', location: 'Bío Bío', lat: -36.8269, lng: -73.0498, pm25: 25, pm10: 38, o3: 38, no2: 18 },
    { id: 12, name: 'Temuco', location: 'Araucanía', lat: -38.7359, lng: -72.5904, pm25: 85, pm10: 120, o3: 15, no2: 28 },
    { id: 13, name: 'Valparaíso', location: 'Valparaíso', lat: -33.0472, lng: -71.6127, pm25: 22, pm10: 35, o3: 45, no2: 20 },
    { id: 14, name: 'Rancagua', location: 'O\'Higgins', lat: -34.1708, lng: -70.7444, pm25: 55, pm10: 82, o3: 22, no2: 35 },
    { id: 15, name: 'Coyhaique', location: 'Aysén', lat: -45.5712, lng: -72.0685, pm25: 95, pm10: 145, o3: 12, no2: 22 }
];

// ===== Emergency Types =====
const EMERGENCY_TYPES = {
    'corte-agua': { icon: '💧', label: 'Corte de agua', category: 'corte' },
    'corte-luz': { icon: '💡', label: 'Corte de luz', category: 'corte' },
    'corte-gas': { icon: '🔥', label: 'Corte de gas', category: 'corte' },
    'accidente': { icon: '🚗', label: 'Accidente', category: 'accidente' },
    'incendio': { icon: '🔥', label: 'Incendio', category: 'incendio' },
    'inundacion': { icon: '🌊', label: 'Inundación', category: 'otro' },
    'derrumbe': { icon: '🏚️', label: 'Derrumbe', category: 'otro' },
    'otro': { icon: '⚠️', label: 'Otro', category: 'otro' }
};

// ===== Application State =====
const state = {
    map: null,
    markers: {
        stations: [],
        emergencies: []
    },
    selectedStation: null,
    emergencies: [],
    userLocation: null,
    activeFilter: 'all',
    airHistoryChart: null,
    searchTimeout: null,
    deferredPrompt: null,
    regionFilter: 'all',
    currentTheme: 'dark',
    notificationsEnabled: false
};

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMap();
    loadStations();
    loadEmergencies();
    setupEventListeners();
    setupSearchListeners();
    setupThemeToggle();
    setupNotifications();
    setupRegionFilter();
    initAirHistoryChart();
    simulateDataUpdates();
    setupPWAInstall();
});

// ===== Initialize Map =====
function initMap() {
    state.map = L.map('map', {
        center: CONFIG.map.center,
        zoom: CONFIG.map.zoom,
        minZoom: CONFIG.map.minZoom,
        maxZoom: CONFIG.map.maxZoom,
        zoomControl: true
    });

    L.tileLayer(CONFIG.tileLayer.url, {
        attribution: CONFIG.tileLayer.attribution,
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(state.map);

    // Move zoom control to bottom right
    state.map.zoomControl.setPosition('bottomright');
}

// ===== Load Stations =====
function loadStations() {
    const stationsScroll = document.getElementById('stationsScroll');
    stationsScroll.innerHTML = '';

    // Clear existing station markers
    state.markers.stations.forEach(m => m.marker.remove());
    state.markers.stations = [];

    // Get filtered stations
    const filteredStations = getFilteredStations();

    // Update station count
    const stationCount = document.getElementById('stationCount');
    if (stationCount) {
        stationCount.textContent = `(${filteredStations.length})`;
    }

    filteredStations.forEach(station => {
        const ica = calculateICA(station);
        const icaInfo = getICAInfo(ica);

        // Create marker
        const markerIcon = L.divIcon({
            className: 'station-marker-wrapper',
            html: `<div class="station-marker" style="background: ${icaInfo.color}">${ica}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const marker = L.marker([station.lat, station.lng], { icon: markerIcon })
            .addTo(state.map)
            .on('click', () => selectStation(station));

        state.markers.stations.push({ station, marker });

        // Create station list item
        const stationEl = document.createElement('div');
        stationEl.className = 'station-item';
        stationEl.dataset.id = station.id;
        stationEl.innerHTML = `
            <div class="station-indicator" style="background: ${icaInfo.color}"></div>
            <div class="station-info">
                <div class="station-name">${station.name}</div>
                <div class="station-location">${station.location}</div>
            </div>
            <div class="station-ica" style="color: ${icaInfo.color}">${ica}</div>
        `;
        stationEl.addEventListener('click', () => selectStation(station));
        stationsScroll.appendChild(stationEl);
    });

    // Select first station by default
    if (filteredStations.length > 0) {
        selectStation(filteredStations[0]);
    }
}

// ===== Calculate ICA (Air Quality Index) =====
function calculateICA(station) {
    // Simplified ICA calculation based on PM2.5 (main indicator)
    const pm25 = station.pm25;
    if (pm25 <= 12) return Math.round((50 / 12) * pm25);
    if (pm25 <= 35.4) return Math.round(50 + ((100 - 50) / (35.4 - 12)) * (pm25 - 12));
    if (pm25 <= 55.4) return Math.round(100 + ((150 - 100) / (55.4 - 35.4)) * (pm25 - 35.4));
    if (pm25 <= 150.4) return Math.round(150 + ((200 - 150) / (150.4 - 55.4)) * (pm25 - 55.4));
    if (pm25 <= 250.4) return Math.round(200 + ((300 - 200) / (250.4 - 150.4)) * (pm25 - 150.4));
    return Math.round(300 + ((500 - 300) / (500.4 - 250.4)) * (pm25 - 250.4));
}

// ===== Select Station =====
function selectStation(station) {
    state.selectedStation = station;
    const ica = calculateICA(station);
    const icaInfo = getICAInfo(ica);

    // Update ICA display
    const icaDisplay = document.getElementById('icaDisplay');
    icaDisplay.style.background = `linear-gradient(135deg, ${icaInfo.color}, ${adjustColor(icaInfo.color, -20)})`;
    icaDisplay.querySelector('.ica-value').textContent = ica;

    document.getElementById('icaStatus').textContent = icaInfo.status;
    document.getElementById('icaStation').textContent = station.name;

    // Update pollutant bars
    updatePollutantBar('pm25', station.pm25, 150);
    updatePollutantBar('pm10', station.pm10, 250);
    updatePollutantBar('o3', station.o3, 100);
    updatePollutantBar('no2', station.no2, 100);

    // Update station list selection
    document.querySelectorAll('.station-item').forEach(el => {
        el.classList.toggle('active', parseInt(el.dataset.id) === station.id);
    });

    // Center map on station
    state.map.setView([station.lat, station.lng], 13, { animate: true });

    // Show popup
    L.popup()
        .setLatLng([station.lat, station.lng])
        .setContent(`
            <div style="text-align: center; padding: 8px;">
                <strong style="font-size: 1.1rem;">${station.name}</strong><br>
                <span style="color: ${icaInfo.color}; font-weight: bold;">ICA: ${ica} - ${icaInfo.status}</span><br>
                <small style="color: #94a3b8;">PM2.5: ${station.pm25} µg/m³</small>
            </div>
        `)
        .openOn(state.map);

    // Update historical chart
    updateAirHistoryChart(station);
}

// ===== Update Pollutant Bar =====
function updatePollutantBar(pollutant, value, max) {
    const percentage = Math.min((value / max) * 100, 100);
    document.getElementById(`${pollutant}Bar`).style.width = `${percentage}%`;
    document.getElementById(`${pollutant}Value`).textContent = `${value} µg/m³`;
}

// ===== Adjust Color Brightness =====
function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

// ===== Load Emergencies =====
function loadEmergencies() {
    // Load from localStorage
    const saved = localStorage.getItem('chilealerta_emergencies');
    if (saved) {
        state.emergencies = JSON.parse(saved);
    } else {
        // Initial demo emergencies
        state.emergencies = [
            {
                id: 1,
                type: 'corte-luz',
                description: 'Corte de luz afectando a varias manzanas en el sector',
                location: 'Av. Providencia 2100',
                lat: -33.4280,
                lng: -70.6150,
                timestamp: Date.now() - 3600000 // 1 hour ago
            },
            {
                id: 2,
                type: 'accidente',
                description: 'Colisión entre dos vehículos, tránsito lento',
                location: 'Rotonda Grecia',
                lat: -33.4580,
                lng: -70.5820,
                timestamp: Date.now() - 7200000 // 2 hours ago
            },
            {
                id: 3,
                type: 'corte-agua',
                description: 'Rotura de matriz de agua, corte programado hasta las 18:00',
                location: 'La Florida, sector Rojas Magallanes',
                lat: -33.5180,
                lng: -70.5920,
                timestamp: Date.now() - 1800000 // 30 min ago
            }
        ];
        saveEmergencies();
    }

    renderEmergencies();
    updateEmergencyMarkers();
}

// ===== Render Emergencies List =====
function renderEmergencies() {
    const list = document.getElementById('emergencyList');
    const emptyState = document.getElementById('emptyEmergencies');

    // Filter emergencies
    let filtered = state.emergencies;
    if (state.activeFilter !== 'all') {
        filtered = state.emergencies.filter(e => {
            const type = EMERGENCY_TYPES[e.type];
            return type && type.category === state.activeFilter;
        });
    }

    if (filtered.length === 0) {
        list.innerHTML = '';
        list.appendChild(emptyState);
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        list.innerHTML = filtered.map(emergency => {
            const type = EMERGENCY_TYPES[emergency.type] || EMERGENCY_TYPES.otro;
            const timeAgo = getTimeAgo(emergency.timestamp);
            return `
                <div class="emergency-item" data-id="${emergency.id}">
                    <div class="emergency-header">
                        <span class="emergency-type">${type.icon} ${type.label}</span>
                        <span class="emergency-time">${timeAgo}</span>
                    </div>
                    <p class="emergency-description">${emergency.description}</p>
                    <span class="emergency-location">📍 ${emergency.location}</span>
                </div>
            `;
        }).join('');

        // Add click listeners
        list.querySelectorAll('.emergency-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = parseInt(el.dataset.id);
                const emergency = state.emergencies.find(e => e.id === id);
                if (emergency) {
                    state.map.setView([emergency.lat, emergency.lng], 15, { animate: true });
                }
            });
        });
    }

    // Update stats
    document.getElementById('totalReports').textContent = state.emergencies.length;
    document.getElementById('activeReports').textContent = state.emergencies.filter(e =>
        Date.now() - e.timestamp < 86400000 // Less than 24 hours old
    ).length;
}

// ===== Update Emergency Markers =====
function updateEmergencyMarkers() {
    // Clear existing markers
    state.markers.emergencies.forEach(m => m.marker.remove());
    state.markers.emergencies = [];

    // Add new markers
    state.emergencies.forEach(emergency => {
        const type = EMERGENCY_TYPES[emergency.type] || EMERGENCY_TYPES.otro;

        const markerIcon = L.divIcon({
            className: 'emergency-marker-wrapper',
            html: `<div class="emergency-marker">${type.icon}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        const marker = L.marker([emergency.lat, emergency.lng], { icon: markerIcon })
            .addTo(state.map)
            .bindPopup(`
                <div style="padding: 8px;">
                    <strong>${type.icon} ${type.label}</strong><br>
                    <p style="margin: 8px 0; color: #f8fafc;">${emergency.description}</p>
                    <small style="color: #94a3b8;">📍 ${emergency.location}</small>
                </div>
            `);

        state.markers.emergencies.push({ emergency, marker });
    });
}

// ===== Get Time Ago String =====
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Hace un momento';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
}

// ===== Save Emergencies to LocalStorage =====
function saveEmergencies() {
    localStorage.setItem('chilealerta_emergencies', JSON.stringify(state.emergencies));
}

// ===== Setup Event Listeners =====
function setupEventListeners() {
    // Panel toggles
    document.getElementById('toggleAir').addEventListener('click', () => {
        document.getElementById('panelAir').classList.toggle('collapsed');
    });

    document.getElementById('toggleEmergencies').addEventListener('click', () => {
        document.getElementById('panelEmergencies').classList.toggle('collapsed');
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.activeFilter = btn.dataset.filter;
            renderEmergencies();
        });
    });

    // Location button
    document.getElementById('btnLocation').addEventListener('click', getUserLocation);

    // Report button
    document.getElementById('btnReport').addEventListener('click', openReportModal);

    // Modal events
    document.getElementById('modalOverlay').addEventListener('click', closeReportModal);
    document.getElementById('modalClose').addEventListener('click', closeReportModal);
    document.getElementById('btnCancel').addEventListener('click', closeReportModal);

    // Use my location in form
    document.getElementById('useMyLocation').addEventListener('click', useLocationForReport);

    // Report form submission
    document.getElementById('reportForm').addEventListener('submit', submitReport);

    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeReportModal();
    });
}

// ===== Get User Location =====
function getUserLocation() {
    if (!navigator.geolocation) {
        showToast('Tu navegador no soporta geolocalización', 'error');
        return;
    }

    showToast('Obteniendo ubicación...', 'success');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            state.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            state.map.setView([state.userLocation.lat, state.userLocation.lng], 14, { animate: true });

            // Add/update user marker
            if (state.userMarker) {
                state.userMarker.setLatLng([state.userLocation.lat, state.userLocation.lng]);
            } else {
                const userIcon = L.divIcon({
                    className: 'user-marker-wrapper',
                    html: `<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });
                state.userMarker = L.marker([state.userLocation.lat, state.userLocation.lng], { icon: userIcon })
                    .addTo(state.map)
                    .bindPopup('📍 Tu ubicación');
            }

            showToast('Ubicación encontrada', 'success');
        },
        (error) => {
            showToast('No se pudo obtener tu ubicación', 'error');
            console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// ===== Modal Functions =====
function openReportModal() {
    document.getElementById('reportModal').classList.add('active');
    document.getElementById('reportForm').reset();
    document.getElementById('reportLat').value = '';
    document.getElementById('reportLng').value = '';
    document.getElementById('locationHint').textContent = 'Haz clic en 📍 para usar tu ubicación actual';
}

function closeReportModal() {
    document.getElementById('reportModal').classList.remove('active');
}

function useLocationForReport() {
    if (!navigator.geolocation) {
        showToast('Tu navegador no soporta geolocalización', 'error');
        return;
    }

    const hint = document.getElementById('locationHint');
    hint.textContent = 'Obteniendo ubicación...';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            document.getElementById('reportLat').value = lat;
            document.getElementById('reportLng').value = lng;
            document.getElementById('reportLocation').value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            hint.textContent = '✅ Ubicación capturada';
            hint.style.color = '#00e676';
        },
        (error) => {
            hint.textContent = '❌ No se pudo obtener la ubicación';
            hint.style.color = '#f44336';
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// ===== Submit Report =====
function submitReport(e) {
    e.preventDefault();

    const type = document.getElementById('reportType').value;
    const description = document.getElementById('reportDescription').value;
    const location = document.getElementById('reportLocation').value;
    let lat = parseFloat(document.getElementById('reportLat').value);
    let lng = parseFloat(document.getElementById('reportLng').value);

    // If no coordinates, use map center
    if (!lat || !lng) {
        const center = state.map.getCenter();
        lat = center.lat;
        lng = center.lng;
    }

    const emergency = {
        id: Date.now(),
        type,
        description,
        location,
        lat,
        lng,
        timestamp: Date.now()
    };

    state.emergencies.unshift(emergency);
    saveEmergencies();
    renderEmergencies();
    updateEmergencyMarkers();

    closeReportModal();
    showToast('¡Reporte enviado con éxito!', 'success');

    // Center on new emergency
    state.map.setView([lat, lng], 15, { animate: true });
}

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
        <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== Simulate Data Updates =====
function simulateDataUpdates() {
    // Update station values every 30 seconds
    setInterval(() => {
        STATIONS.forEach(station => {
            // Small random fluctuations
            station.pm25 = Math.max(5, station.pm25 + Math.floor(Math.random() * 11) - 5);
            station.pm10 = Math.max(10, station.pm10 + Math.floor(Math.random() * 11) - 5);
            station.o3 = Math.max(5, station.o3 + Math.floor(Math.random() * 7) - 3);
            station.no2 = Math.max(5, station.no2 + Math.floor(Math.random() * 7) - 3);
        });

        // Reload stations to update markers and list
        loadStations();

        // Re-select current station if one is selected
        if (state.selectedStation) {
            const updated = STATIONS.find(s => s.id === state.selectedStation.id);
            if (updated) selectStation(updated);
        }
    }, 30000);
}

// ===== Air History Chart =====
function initAirHistoryChart() {
    const ctx = document.getElementById('airHistoryChart');
    if (!ctx) return;

    // Generate simulated 24h historical data
    const labels = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 3600000);
        labels.push(hour.getHours() + ':00');
    }

    state.airHistoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'PM2.5',
                data: generateHistoricalData(24, 20, 80),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f8fafc',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 6 }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#64748b', font: { size: 10 } },
                    min: 0
                }
            }
        }
    });
}

function generateHistoricalData(count, min, max) {
    const data = [];
    let value = min + Math.random() * (max - min) / 2;
    for (let i = 0; i < count; i++) {
        value += (Math.random() - 0.5) * 15;
        value = Math.max(min, Math.min(max, value));
        data.push(Math.round(value));
    }
    return data;
}

function updateAirHistoryChart(station) {
    if (!state.airHistoryChart) return;

    const newData = generateHistoricalData(24, station.pm25 * 0.5, station.pm25 * 1.5);
    state.airHistoryChart.data.datasets[0].data = newData;

    // Update color based on current ICA
    const ica = calculateICA(station);
    const icaInfo = getICAInfo(ica);
    state.airHistoryChart.data.datasets[0].borderColor = icaInfo.color;
    state.airHistoryChart.data.datasets[0].backgroundColor = icaInfo.color + '20';

    state.airHistoryChart.update('none');
}

// ===== Address Search (using Nominatim) =====
function setupSearchListeners() {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        searchClear.style.display = query ? 'flex' : 'none';

        if (query.length < 3) {
            searchResults.classList.remove('active');
            return;
        }

        // Debounce search
        clearTimeout(state.searchTimeout);
        state.searchTimeout = setTimeout(() => searchAddress(query), 500);
    });

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.display = 'none';
        searchResults.classList.remove('active');
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-center')) {
            searchResults.classList.remove('active');
        }
    });
}

async function searchAddress(query) {
    const searchResults = document.getElementById('searchResults');

    searchResults.innerHTML = '<div class="search-loading">Buscando...</div>';
    searchResults.classList.add('active');

    try {
        // Use Nominatim for geocoding (free, no API key needed)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Chile')}&limit=5&countrycodes=cl`,
            { headers: { 'Accept-Language': 'es' } }
        );

        const results = await response.json();

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-loading">No se encontraron resultados</div>';
            return;
        }

        searchResults.innerHTML = results.map(result => `
            <div class="search-result-item" data-lat="${result.lat}" data-lng="${result.lon}">
                <span class="search-result-icon">📍</span>
                <div class="search-result-text">
                    <div class="search-result-name">${result.display_name.split(',')[0]}</div>
                    <div class="search-result-address">${result.display_name.split(',').slice(1, 3).join(',')}</div>
                </div>
            </div>
        `).join('');

        // Add click listeners to results
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const lat = parseFloat(item.dataset.lat);
                const lng = parseFloat(item.dataset.lng);

                state.map.setView([lat, lng], 15, { animate: true });

                // Add temporary marker
                const marker = L.marker([lat, lng])
                    .addTo(state.map)
                    .bindPopup(`<strong>📍 ${item.querySelector('.search-result-name').textContent}</strong>`)
                    .openPopup();

                // Remove marker after 30 seconds
                setTimeout(() => marker.remove(), 30000);

                searchResults.classList.remove('active');
                document.getElementById('searchInput').value = item.querySelector('.search-result-name').textContent;
            });
        });

    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = '<div class="search-loading">Error al buscar</div>';
    }
}

// ===== Theme Toggle =====
function initTheme() {
    const savedTheme = localStorage.getItem('chilealerta_theme') || 'dark';
    state.currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
}

function setupThemeToggle() {
    const btnTheme = document.getElementById('btnTheme');
    if (!btnTheme) return;

    btnTheme.addEventListener('click', () => {
        state.currentTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', state.currentTheme);
        localStorage.setItem('chilealerta_theme', state.currentTheme);
        updateThemeIcon();
        showToast(`Tema ${state.currentTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'success');
    });
}

function updateThemeIcon() {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.textContent = state.currentTheme === 'dark' ? '🌙' : '☀️';
    }
}

// ===== Notifications =====
function setupNotifications() {
    const btnNotifications = document.getElementById('btnNotifications');
    if (!btnNotifications) return;

    btnNotifications.addEventListener('click', async () => {
        if (!('Notification' in window)) {
            showToast('Tu navegador no soporta notificaciones', 'error');
            return;
        }

        if (Notification.permission === 'granted') {
            state.notificationsEnabled = !state.notificationsEnabled;
            updateNotificationBadge();
            showToast(state.notificationsEnabled ?
                'Notificaciones activadas 🔔' :
                'Notificaciones desactivadas', 'success');

            if (state.notificationsEnabled) {
                checkAirQualityAlerts();
            }
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                state.notificationsEnabled = true;
                updateNotificationBadge();
                showToast('¡Notificaciones activadas! 🔔', 'success');
                checkAirQualityAlerts();
            }
        } else {
            showToast('Las notificaciones están bloqueadas en tu navegador', 'error');
        }
    });
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;

    if (state.notificationsEnabled) {
        // Count stations with bad air quality (ICA > 100)
        const alertCount = STATIONS.filter(s => calculateICA(s) > 100).length;
        if (alertCount > 0) {
            badge.textContent = alertCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    } else {
        badge.style.display = 'none';
    }
}

function checkAirQualityAlerts() {
    if (!state.notificationsEnabled) return;

    const badStations = STATIONS.filter(s => calculateICA(s) > 150);

    if (badStations.length > 0) {
        const worst = badStations.reduce((a, b) =>
            calculateICA(a) > calculateICA(b) ? a : b
        );
        const ica = calculateICA(worst);

        new Notification('⚠️ Alerta de Calidad del Aire', {
            body: `${worst.name}: ICA ${ica} - ${getICAInfo(ica).status}`,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            tag: 'air-quality-alert'
        });
    }

    updateNotificationBadge();
}

// ===== Region Filter =====
function setupRegionFilter() {
    const regionSelect = document.getElementById('regionSelect');
    if (!regionSelect) return;

    regionSelect.addEventListener('change', (e) => {
        state.regionFilter = e.target.value;
        loadStations();
        showToast(`Mostrando: ${e.target.value === 'all' ? 'Todas las regiones' : e.target.value}`, 'success');
    });
}

function getFilteredStations() {
    if (state.regionFilter === 'all') {
        return STATIONS;
    }

    return STATIONS.filter(station => {
        const location = station.location.toLowerCase();
        const filter = state.regionFilter.toLowerCase();

        if (filter === 'rm') {
            return location.includes('rm') || location.includes('metropolitana');
        }
        return location.includes(filter);
    });
}

// ===== PWA Install Prompt =====
function setupPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        state.deferredPrompt = e;

        // Show install button (could be added to UI)
        console.log('💾 PWA instalable disponible');
    });

    window.addEventListener('appinstalled', () => {
        state.deferredPrompt = null;
        showToast('¡ChileAlerta instalada! 🎉', 'success');
    });
}

// ===== Console Welcome Message =====
console.log('%c🇨🇱 ChileAlerta v3.0', 'font-size: 24px; font-weight: bold; color: #6366f1;');
console.log('%cMonitor de Emergencias y Ambiente en Tiempo Real', 'font-size: 12px; color: #94a3b8;');
console.log('%c🎨 Con tema claro/oscuro, notificaciones y filtro por región', 'font-size: 10px; color: #64748b;');
