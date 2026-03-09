// Global variables
let currentUser = null;
let catalogData = [];
let users = {
    'admin': 'akiva2024',
    'collector1': 'vinyl2024',
    'collector2': 'records2024',
    'guest': 'music2024',
    'friend': 'rockstar2024'
};

// DOM elements
const loginSection = document.getElementById('loginSection');
const mainApp = document.getElementById('mainApp');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const manualBtn = document.getElementById('manualBtn');
const manualModal = document.getElementById('manualModal');
const manualForm = document.getElementById('manualForm');
const catalogBody = document.getElementById('catalogBody');
const exportBtn = document.getElementById('exportBtn');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadCatalogData();
    setupEventListeners();
    displayCatalog();
});

function setupEventListeners() {
    // Login functionality
    loginBtn.addEventListener('click', handleLogin);
    
    // Allow Enter key for login
    document.getElementById('username').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogin();
    });
    
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Manual entry modal
    manualBtn.addEventListener('click', () => {
        manualModal.style.display = 'block';
    });
    
    // Help modal
    helpBtn.addEventListener('click', () => {
        helpModal.style.display = 'block';
    });
    
    // Close modals
    document.querySelector('.close').addEventListener('click', () => {
        manualModal.style.display = 'none';
    });
    
    document.querySelector('.close-help').addEventListener('click', () => {
        helpModal.style.display = 'none';
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === manualModal) {
            manualModal.style.display = 'none';
        }
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
    
    // Manual form submission
    manualForm.addEventListener('submit', handleManualEntry);
    
    // Export functionality
    exportBtn.addEventListener('click', exportToExcel);
}

function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (users[username] && users[username] === password) {
        currentUser = username;
        loginSection.style.display = 'none';
        mainApp.style.display = 'block';
        
        showNotification(`Welcome back, ${username}! Rock on! 🎸`);
    } else {
        showNotification('Invalid credentials. Try again, rockstar!', 'error');
    }
    
    // Clear form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function handleLogout() {
    currentUser = null;
    mainApp.style.display = 'none';
    loginSection.style.display = 'block';
    showNotification('Logged out successfully. Keep on rockin\'!');
}

function handleManualEntry(e) {
    e.preventDefault();
    
    const albumData = {
        id: Date.now(),
        artist: document.getElementById('manualArtist').value,
        album: document.getElementById('manualAlbum').value,
        year: document.getElementById('manualYear').value || 'Unknown',
        genre: document.getElementById('manualGenre').value || 'Unknown',
        format: document.getElementById('manualFormat').value,
        price: 'Fetching...',
        image: 'https://via.placeholder.com/150x150?text=No+Image',
        addedBy: currentUser,
        dateAdded: new Date().toISOString()
    };
    
    // Check for duplicates
    const duplicate = catalogData.find(item => 
        item.artist.toLowerCase() === albumData.artist.toLowerCase() && 
        item.album.toLowerCase() === albumData.album.toLowerCase()
    );
    
    if (duplicate) {
        const confirm = window.confirm(`This album "${albumData.artist} - ${albumData.album}" already exists in your collection. Add anyway? (Maybe you have multiple copies?)`);
        if (!confirm) {
            return;
        }
        albumData.duplicate = true;
    }
    
    catalogData.push(albumData);
    saveCatalogData();
    displayCatalog();
    
    // Clear form and close modal
    manualForm.reset();
    manualModal.style.display = 'none';
    
    showNotification(`Added "${albumData.artist} - ${albumData.album}" to your collection! 🎵`);
    
    fetchDiscogsData(albumData);
}

function displayCatalog() {
    catalogBody.innerHTML = '';
    
    if (catalogData.length === 0) {
        catalogBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #ffd700; font-style: italic;">
                    No albums in your collection yet. Start adding some vinyl! 🎵
                </td>
            </tr>
        `;
        return;
    }
    
    catalogData.forEach(album => {
        const row = document.createElement('tr');
        if (album.duplicate) {
            row.classList.add('duplicate');
            row.style.background = 'rgba(255, 255, 0, 0.1)';
        }
        
        row.innerHTML = `
            <td><img src="${album.image}" alt="${album.album}" class="album-art"></td>
            <td>${album.artist}</td>
            <td>${album.album} ${album.duplicate ? '⚠️' : ''}</td>
            <td>${album.year}</td>
            <td>${album.genre}</td>
            <td>${album.format}</td>
            <td>${album.price}</td>
            <td>
                <button onclick="deleteAlbum(${album.id})" class="btn" style="background: #f44336; padding: 0.5rem;">Delete</button>
            </td>
        `;
        
        catalogBody.appendChild(row);
    });
}

function deleteAlbum(id) {
    if (confirm('Are you sure you want to remove this album from your collection?')) {
        catalogData = catalogData.filter(album => album.id !== id);
        saveCatalogData();
        displayCatalog();
        showNotification('Album removed from collection.');
    }
}

function saveCatalogData() {
    localStorage.setItem('akivasVinylVault', JSON.stringify(catalogData));
}

function loadCatalogData() {
    const saved = localStorage.getItem('akivasVinylVault');
    if (saved) {
        catalogData = JSON.parse(saved);
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f44336' : '#4CAF50'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-weight: bold;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

async function fetchDiscogsData(albumData) {
    console.log('Fetching Discogs data for:', albumData.artist, albumData.album);
}

function exportToExcel() {
    showNotification('Excel export will be implemented in Phase 5!');
}

// Add some sample data for testing
if (catalogData.length === 0) {
    catalogData = [
        {
            id: 1,
            artist: 'Pink Floyd',
            album: 'The Dark Side of the Moon',
            year: '1973',
            genre: 'Progressive Rock',
            format: 'LP',
            price: '\$25.99',
            image: 'https://via.placeholder.com/150x150?text=Pink+Floyd',
            addedBy: 'admin',
            dateAdded: new Date().toISOString()
        },
        {
            id: 2,
            artist: 'Led Zeppelin',
            album: 'Led Zeppelin IV',
            year: '1971',
            genre: 'Hard Rock',
            format: 'LP',
            price: '\$22.50',
            image: 'https://via.placeholder.com/150x150?text=Led+Zeppelin',
            addedBy: 'admin',
            dateAdded: new Date().toISOString()
        }
    ];
    saveCatalogData();
}