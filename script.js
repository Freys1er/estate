// CONFIGURATION
const API_URL = 'https://script.google.com/macros/s/AKfycbx0XhgtDREh_XSZ7ONwJfMlamZu_gzhdYL9FkVKzvaPfhvAk998H42R56P_JYu0Genfpg/exec';

// SHARED UTILS
const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 1. FETCH ALL PROPERTIES (For properties.html)
async function loadProperties() {
    const grid = document.getElementById('property-grid');
    if (!grid) return;

    try {
        const res = await fetch(`${API_URL}?action=getAll`);
        const json = await res.json();
        
        grid.innerHTML = ''; // Clear Skeletons

        if (json.length === 0) {
            grid.innerHTML = '<p>No listings available.</p>';
            return;
        }

        json.forEach(p => {
            const card = document.createElement('div');
            card.className = 'property-card';
            card.innerHTML = `
                <a href="property.html?id=${p.id}">
                    <div class="card-img-wrapper">
                        <img src="${p.image}" onerror="this.src='https://via.placeholder.com/400x300?text=Freyster+Dev'" alt="${p.title}">
                    </div>
                    <div class="card-body">
                        <span class="price">${p.price}</span>
                        <h3>${p.title}</h3>
                        <p class="loc">📍 ${p.location}</p>
                    </div>
                </a>
            `;
            grid.appendChild(card);
        });
    } catch (e) {
        console.error(e);
        grid.innerHTML = '<p>System currently offline for maintenance.</p>';
    }
}

// 2. FETCH SINGLE PROPERTY (For property.html)
async function loadPropertyDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (!id) {
        window.location.href = 'properties.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}?action=getOne&id=${id}`);
        const p = await res.json();

        if (p.error) {
            document.getElementById('detail-container').innerHTML = '<h1>Property not found</h1>';
            return;
        }

        // Hide Skeleton, Show Content
        document.getElementById('skeleton-loader').style.display = 'none';
        document.getElementById('real-content').style.display = 'block';

        // Inject Data
        document.getElementById('prop-img').src = p.main_image || 'https://via.placeholder.com/1200';
        document.getElementById('prop-title').innerText = p.title;
        document.getElementById('prop-price').innerText = p.price;
        document.getElementById('prop-loc').innerText = p.location;
        document.getElementById('prop-desc').innerText = p.description;
        document.getElementById('prop-specs').innerText = p.specs;
        
        // Setup Contact Form Context
        const interestInput = document.getElementById('interest');
        if(interestInput) interestInput.value = `Inquiry: ${p.title} (ID: ${p.id})`;

        // Render Gallery
        const gallery = document.getElementById('gallery-grid');
        if (p.gallery && p.gallery.length > 0) {
            p.gallery.forEach(img => {
                gallery.innerHTML += `<img src="${img}" onclick="window.open('${img}')">`;
            });
        }

    } catch (e) {
        console.error(e);
    }
}

// 3. HANDLE CONTACT FORM
async function sendContact(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const status = document.getElementById('form-status');
    const originalText = btn.innerText;

    btn.disabled = true;
    btn.innerText = "SENDING...";

    const formData = new FormData(e.target);
    const params = new URLSearchParams();
    params.append('action', 'contact');
    for (const pair of formData.entries()) {
        params.append(pair[0], pair[1]);
    }

    try {
        await fetch(`${API_URL}?${params.toString()}`);
        status.style.display = 'block';
        status.style.color = '#D4AF37';
        status.innerText = "Message received. We will contact you shortly.";
        e.target.reset();
    } catch (err) {
        status.innerText = "Error sending message. Please email directly.";
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
}