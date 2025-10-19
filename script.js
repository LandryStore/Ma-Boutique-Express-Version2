// === CONFIGURATION ===
const CONFIG = {
  jsonUrl: 'products.json',
  gridId: 'grid',
  countId: 'product-count',
  searchId: 'search-input',
  refreshId: 'refresh-btn',
  toastId: 'toast'
};

// === ÉLÉMENTS DU DOM ===
const grid = document.getElementById(CONFIG.gridId);
const countSpan = document.getElementById(CONFIG.countId);
const searchInput = document.getElementById(CONFIG.searchId);
const refreshBtn = document.getElementById(CONFIG.refreshId);
const toast = document.getElementById(CONFIG.toastId);

let ALL_PRODUCTS = [];

// === FONCTION PRINCIPALE DE CHARGEMENT ===
async function loadProducts() {
  try {
    const res = await fetch(CONFIG.jsonUrl, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}: impossible de charger les produits.`);
    }

    const data = await res.json();
    ALL_PRODUCTS = Array.isArray(data) ? data : [];

    // Nettoyage silencieux : on garde uniquement les produits avec image et prix
    ALL_PRODUCTS = ALL_PRODUCTS.filter(p => 
      p && p.image && p.image.trim() !== '' && 
      p.price && p.price.trim() !== '' && 
      p.name && p.name.trim() !== ''
    );

    renderProducts(ALL_PRODUCTS);
    showToast('✅ Produits chargés avec succès !');

  } catch (error) {
    console.error('[ERREUR CHARGEMENT]', error);
    showToast(`❌ Erreur : ${error.message || 'Impossible de charger les produits.'}`);
    renderProducts([]);
  }
}

// === AFFICHAGE DES PRODUITS ===
function renderProducts(list) {
  if (!grid) {
    console.warn('⚠️ Élément #grid introuvable. Vérifie ton HTML.');
    return;
  }

  grid.innerHTML = '';
  const count = Array.isArray(list) ? list.length : 0;
  if (countSpan) countSpan.textContent = count;

  if (count === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>Aucun produit à afficher.</p>
        <p>Vérifie que <code>products.json</code> est valide et accessible.</p>
      </div>
    `;
    return;
  }

  list.forEach(p => {
    // Valeurs par défaut sécurisées
    const name = p.name || 'Produit sans nom';
    const image = p.image?.trim() || '';
    const price = p.price || '';
    list.forEach((grand) => {
  const card = document.createElement("div");
  card.className = "card";

  const name = document.createElement("h4");
  name.innerText = grand.name;

  const img = document.createElement("img");
  img.src = grand.image;

  const prix = document.createElement("p");
  prix.innerText = `${grand.prix}€`;

  // 👉 AJOUTE CE BLOC JUSTE APRÈS
  const bouton = document.createElement("a");
  bouton.href = grand.link;
  bouton.innerText = "Voir sur Amazon";
  bouton.target = "_blank";
  bouton.rel = "noopener noreferrer";
  bouton.className = "amazon-button";

  // Ajoute les éléments dans la carte
  card.appendChild(name);
  card.appendChild(img);
  card.appendChild(prix);
  card.appendChild(bouton);

  // Ajoute la carte dans le lien ou dans la grille
  grid.appendChild(card); // ou link.appendChild(card) selon ta structure
});

    const link = p.link?.trim() || '#';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      ${image ? `<img src="${image}" alt="${name}" onerror="this.style.display='none'">` : ''}
      <h3>${escapeHtml(name)}</h3>
      <p class="price">${escapeHtml(price)}</p>
      <a href="${link}" target="_blank" rel="noopener noreferrer">Voir sur Amazon</a>
    `;
    grid.appendChild(card);
  });
}

// === RECHERCHE EN TEMPS RÉEL ===
function attachSearch() {
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      renderProducts(ALL_PRODUCTS);
      return;
    }

    const filtered = ALL_PRODUCTS.filter(p =>
      (p.name?.toLowerCase() || '').includes(q) ||
      (p.description?.toLowerCase() || '').includes(q)
    );
    renderProducts(filtered);
  });
}

// === TOAST (MESSAGE TEMPORAIRE) ===
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.hidden = true;
  }, 3000);
}

// === ÉCHAPPEMENT HTML (sécurité) ===
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// === INITIALISATION ===
function init() {
  if (!grid) {
    console.error('❌ Élément #grid manquant dans le HTML.');
    return;
  }

  loadProducts();
  attachSearch();

  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadProducts);
  }
}

// Lance l'initialisation quand la page est prête
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}