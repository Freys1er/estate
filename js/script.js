/**
 * THE FREY GROUP - CORE ENGINE V10.0
 * Includes: Error-Proof Image Loaders & Fixed Detail Page Logic
 */

'use strict';

const API_URL = 'https://script.google.com/macros/s/AKfycbx0XhgtDREh_XSZ7ONwJfMlamZu_gzhdYL9FkVKzvaPfhvAk998H42R56P_JYu0Genfpg/exec';

// A clean, dark grey placeholder image (Base64) so it works offline/instantly
const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='24' fill='%23333' text-anchor='middle' dy='.3em'%3ETHE FREY GROUP%3C/text%3E%3C/svg%3E";

// --- 1. HEADER & UI ---
function injectHeader() {
    const headerHTML = `
    <div class="nav-wrapper">
        <nav class="nav-capsule">
            <div class="nav-left">
                <button class="menu-toggle" onclick="toggleMenu()" aria-label="Menu">
                    <span class="bar"></span><span class="bar"></span>
                </button>
                <div class="desktop-links">
                    <a href="properties.html">Collection</a>
                    <a href="philosophy.html">Philosophy</a>
                </div>
            </div>
            <div class="nav-center">
                <a href="index.html" class="logo">THE FREY GROUP</a>
            </div>
            <div class="nav-right">
                <a href="#" aria-label="Profile"><svg class="nav-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></a>
            </div>
        </nav>
    </div>
    <div class="mobile-overlay" id="mobileOverlay">
        <a href="index.html">Home</a>
        <a href="properties.html">The Collection</a>
        <a href="philosophy.html">Philosophy</a>
        <a href="contact.html">Contact</a>
        <button onclick="toggleMenu()" style="margin-top:50px; background:none; border:none; color:white; border-bottom:1px solid white; cursor:pointer;">CLOSE</button>
    </div>`;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // Scroll Logic
    const navWrapper = document.querySelector('.nav-wrapper');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navWrapper.classList.add('scrolled');
        else navWrapper.classList.remove('scrolled');
    });
}

function toggleMenu() {
    document.getElementById('mobileOverlay').classList.toggle('active');
}

// --- 2. DATA ENGINE ---
const fmtPrice = (p) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(p);

async function loadData() {
    try {
        const res = await fetch(`${API_URL}?action=getAll`);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error("Empty Data");
        return data;
    } catch (e) {
        console.warn("API Error. Using Backup Data.");
        return [
            { id: 101, title: 'Villa Lago', location: 'Lugano, Switzerland', price: 12500000, image: 'https://images.unsplash.com/photo-1600596542815-2a4d9f79fad3?w=800&q=80' },
            { id: 102, title: 'Whistler Glass Estate', location: 'Whistler, Canada', price: 8900000, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80' },
            { id: 103, title: 'Xinyi Penthouse', location: 'Taipei, Taiwan', price: 15500000, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80' }
        ];
    }
}

// --- 3. RENDERERS (With Error-Proofing) ---
async function renderGrid(limit = null) {
    const gridId = limit ? 'home-grid' : 'full-grid';
    const grid = document.getElementById(gridId);
    if (!grid) return;

    const data = await loadData();
    const items = limit ? data.slice(0, limit) : data;

    grid.innerHTML = items.map(p => {
        // Safe Image Handling
        const safeImg = p.image ? p.image : FALLBACK_IMG;

        return `
        <div class="card reveal" onclick="window.location.href='property.html?id=${p.id}'">
            <div class="card-img-wrap">
                <img src="${safeImg}" 
                     class="card-img" 
                     loading="lazy" 
                     onerror="this.onerror=null;this.src='${FALLBACK_IMG}';">
            </div>
            <div class="card-meta">
                <span class="card-loc">${p.location || 'Private Location'}</span>
                <h3 class="card-title">${p.title || 'Untitled Estate'}</h3>
                <p class="card-price">${p.price ? fmtPrice(p.price) : 'Price on Request'}</p>
            </div>
        </div>
        `;
    }).join('');

    // Trigger animations
    setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    }, 100);
}

// --- 4. PROPERTY DETAIL PAGE LOGIC ---
async function renderPropertyDetail() {
    const titleEl = document.getElementById('prop-title');
    if (!titleEl) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    // Show loading state
    titleEl.innerText = "Loading...";

    const data = await loadData();
    const property = data.find(p => p.id == id) || data[0]; // Fallback to first if ID not found

    if (property) {
        document.title = `${property.title} | THE FREY GROUP`;

        // Inject Text
        document.getElementById('prop-title').innerText = property.title;
        document.getElementById('prop-loc').innerText = property.location;
        document.getElementById('prop-price').innerText = property.price ? fmtPrice(property.price) : "Price Upon Request";

        // Inject Hero Image (replaces video background)
        const heroBg = document.getElementById('hero-bg');
        if (heroBg) {
            heroBg.style.backgroundImage = `url('${property.image || FALLBACK_IMG}')`;
        }
    }
}

// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {
    injectHeader();
    if (document.getElementById('home-grid')) renderGrid(3);
    if (document.getElementById('full-grid')) renderGrid();
    if (document.getElementById('prop-title')) renderPropertyDetail();
});