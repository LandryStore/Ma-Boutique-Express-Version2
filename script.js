const CONFIG = {
    jsonUrl: 'products.json',
    gridId: 'productGrid',
    countId: 'product-count',
    searchId: 'search-input',
    refreshId: 'refresh-btn',
    toastId: 'toast',
    paginationId: 'pagination'
};

const amazonTag = 'affiliationOeb-20';
const PRODUCTS_PER_PAGE = 10;

let ALL_PRODUCTS = [];
let currentPage = 1;

const grid = document.getElementById(CONFIG.gridId);
const countSpan = document.getElementById(CONFIG.countId);
const searchInput = document.getElementById(CONFIG.searchId);
const refreshBtn = document.getElementById(CONFIG.refreshId);
const toast = document.getElementById(CONFIG.toastId);
const pagination = document.getElementById(CONFIG.paginationId);

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.hidden = true; }, 2000);
}

function generateAffiliateLink(productName) {
    const base = 'https://www.amazon.ca/s';
    const query = encodeURIComponent(productName);
    return `${base}?k=${query}&tag=${amazonTag}`;
}

function renderProducts(list) {
    if (!grid) return;
    grid.innerHTML = '';

    if (!list || list.length === 0) {
        grid.innerHTML = `<div style="text-align:center; padding:3rem; color:#777;">Aucun produit trouvé</div>`;
        if (countSpan) countSpan.textContent = '0';
        return;
    }

    if (countSpan) countSpan.textContent = list.length;

    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    const pageItems = list.slice(start, end);

    pageItems.forEach(p => {
        const name = p.name || 'Produit sans nom';
        const image = p.image?.trim() || 'https://via.placeholder.com/300x300?text=No+Image';
        const price = p.price || '';
        const description = p.description || '';
        const link = p.link?.trim() ? p.link : generateAffiliateLink(name);

        const card = document.createElement('div');
        card.className = 'card';

        const nameEl = document.createElement('h4');
        nameEl.innerText = name;

        const img = document.createElement('img');
        img.src = image;
        img.alt = name;
        img.loading = 'lazy';
        img.onerror = () => { img.src = 'https://via.placeholder.com/300x300?text=No+Image'; };

        const priceEl = document.createElement('p');
        priceEl.className = 'price';
        priceEl.innerHTML = price ? `<strong>${price}</strong>` : '';

        card.appendChild(img);
        card.appendChild(nameEl);
        card.appendChild(priceEl);

        if (description) {
            const shortText = document.createElement('p');
            shortText.className = 'short-text';
            shortText.innerText = description.length > 80 ? description.slice(0, 80) + '...' : description;

            const fullText = document.createElement('p');
            fullText.className = 'full-text';
            fullText.innerText = description;
            fullText.style.display = 'none';

            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'toggle-btn';
            toggleBtn.innerText = 'Lire plus';
            toggleBtn.onclick = () => {
                const expanded = fullText.style.display === 'block';
                fullText.style.display = expanded ? 'none' : 'block';
                shortText.style.display = expanded ? 'block' : 'none';
                toggleBtn.innerText = expanded ? 'Lire plus' : 'Lire moins';
            };

            card.appendChild(shortText);
            card.appendChild(fullText);
            if (description.length > 80) card.appendChild(toggleBtn);
        }

        const btn = document.createElement('a');
        btn.href = link;
        btn.innerText = 'Voir sur Amazon';
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer sponsored';
        btn.className = 'amazon-button';

        card.appendChild(btn);
        grid.appendChild(card);
    });

    renderPagination(list.length);
}

function renderPagination(totalItems) {
    if (!pagination) return;

    const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';
    if (currentPage > 1) {
        html += `<a href="#" class="prev-btn">Précédent</a>`;
    }

    if (currentPage < totalPages) {
        html += `<a href="#" class="next-btn">Suivant</a>`;
    }

    pagination.innerHTML = html;

    const prevBtn = pagination.querySelector('.prev-btn');
    const nextBtn = pagination.querySelector('.next-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage--;
            renderProducts(ALL_PRODUCTS);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage++;
            renderProducts(ALL_PRODUCTS);
        });
    }
}

async function loadProducts() {
    if (refreshBtn) refreshBtn.disabled = true;
    showToast('Chargement...');

    try {
        const res = await fetch(CONFIG.jsonUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        ALL_PRODUCTS = data.map(p => ({
            name: p.name,
            image: p.image,
            description: p.description,
            price: p.price,
            link: p.link,
            category: p.category
        })).filter(p => p.name && p.name.trim() !== '');

        currentPage = 1;
        renderProducts(ALL_PRODUCTS);
        showToast('Produits chargés !');
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur de chargement');
        renderProducts([]);
    } finally {
        if (refreshBtn) refreshBtn.disabled = false;
    }
}

function attachSearch() {
    if (!searchInput) return;
    searchInput.addEventListener('input', () => {
        currentPage = 1;
        const q = searchInput.value.trim().toLowerCase();

        if (q === '') {
            renderProducts(ALL_PRODUCTS);
            return;
        }

        const filtered = ALL_PRODUCTS.filter(p =>
            (p.name?.toLowerCase().includes(q) ||
             p.description?.toLowerCase().includes(q) ||
             p.category?.toLowerCase().includes(q))
        );
        renderProducts(filtered);
    });
}

function init() {
    loadProducts();
    attachSearch();
    if (refreshBtn) refreshBtn.addEventListener('click', loadProducts);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
