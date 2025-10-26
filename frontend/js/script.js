// Use API_BASE from js/config.js
let currentPage = 1;
let filters = { search: '', brand: '', priceRange: '', sortBy: 'newest' };

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
    initializeEventListeners();
});

// Event Listeners
function initializeEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keydown', debounce(() => {
            filters.search = searchInput.value.trim();
            currentPage = 1;
            loadProducts();
        }, 400));
    }

    const brandFilter = document.getElementById('brand-filter');
    if (brandFilter) brandFilter.addEventListener('change', () => { filters.brand = brandFilter.value; currentPage = 1; loadProducts(); });

    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) priceFilter.addEventListener('change', () => { filters.priceRange = priceFilter.value; currentPage = 1; loadProducts(); });

    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) sortFilter.addEventListener('change', () => { filters.sortBy = sortFilter.value; currentPage = 1; loadProducts(); });
}

// API GET request helper
async function apiGet(path) {
    // path should start with '/' and be the route after /api, e.g. '/products?...'
    try {
        const url = `${API_BASE}/api${path}`;
        // attach token if available
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(url, { credentials: 'include', headers });
        if (!res.ok) {
            const body = await res.text().catch(() => '');
            throw new Error(`API ${res.status} ${res.statusText} - ${body}`);
        }
        return await res.json();
    } catch (err) {
        console.error('API GET error', err);
        throw err;
    }
}

// Load Products
async function loadProducts() {
    const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(filters.search && { search: filters.search }),
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.sortBy && { sortBy: filters.sortBy })
    });

    if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-');
        if (min) params.append('minPrice', min);
        if (max) params.append('maxPrice', max);
    }

    const grid = document.getElementById('products-grid');
    if (grid) grid.innerHTML = '<div class="loading">Loading products...</div>';

    try {
        // NOTE: path is '/products' (apiGet prepends '/api')
        const data = await apiGet(`/products?${params.toString()}`);

        // many APIs return { success, products } or an array directly
        const products = Array.isArray(data) ? data : (data.products || data.data || []);

        if (!products || products.length === 0) {
            if (grid) grid.innerHTML = '<div class="error">No products found.</div>';
            return;
        }

        renderProducts(products);
    } catch (err) {
        if (grid) grid.innerHTML = '<div class="error">Error loading products. Please try again.</div>';
    }
}

// Render Products
function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const items = products.map(p => {
        const img = (p.images && p.images.length) ? p.images[0] : 'images/placeholder.jpg';
        const brandName = p.brandId?.name || p.brand || '';
        const price = (p.price != null) ? `₹${(p.price/100).toLocaleString()}` : '';
        return `
            <div class="product-card" onclick="viewProduct('${p._id}')">
                <div class="product-image">
                    <img src="${img}" alt="${escapeHtml(p.name || '')}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${escapeHtml(p.name || '')}</h3>
                    <p class="product-brand">${escapeHtml(brandName)}</p>
                    <div class="product-price">${price}</div>
                    <!-- add data-add so script can find the button for visual feedback -->
                    <button class="btn-primary" data-add="${p._id}" onclick="event.stopPropagation(); addToCart('${p._id}')">Add to Cart</button>
                </div>
            </div>
        `;
    }).join('');
    grid.innerHTML = items;
}

// Filter Products (called on filter change)
function filterProducts() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) filters.search = searchInput.value.trim();

    const brandFilter = document.getElementById('brand-filter');
    if (brandFilter) filters.brand = brandFilter.value;

    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) filters.priceRange = priceFilter.value;

    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) filters.sortBy = sortFilter.value;

    currentPage = 1;
    loadProducts();
}

// Search Products (called by search button)
function searchProducts() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        filters.search = searchInput.value.trim();
        currentPage = 1;
        loadProducts();
    }
}

// View Product Details
function viewProduct(productId) {
    if (!productId) return;
    window.location.href = `product.html?id=${productId}`;
}

// Helper: try multiple endpoints until one works
async function tryFetchEndpoints(method, endpoints, options = {}) {
  let lastErr = null;
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${API_BASE}${ep}`, options);
      // if route not found, try next
      if (res.status === 404) {
        lastErr = new Error(`404 ${ep}`);
        continue;
      }
      return res; // may be 200, 401, 400, etc.
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('No endpoints responded');
}

// Add to Cart (calls backend POST /api/cart/add)
async function addToCart(productId) {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // UI: find the Add button and disable it while request runs
    const btn = document.querySelector(`button[data-add="${productId}"]`);
    if (btn) {
      btn.disabled = true;
      btn.dataset.origText = btn.innerText;
      btn.innerText = 'Adding...';
    }

    const res = await fetch(`${API_BASE}/api/cart/add`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId, quantity: 1 }),
      credentials: 'include'
    });

    if (res.status === 401) {
      showNotification('Please login to add items to cart', 'error');
      if (btn) { btn.disabled = false; btn.innerText = btn.dataset.origText || 'Add to Cart'; }
      return;
    }

    if (!res.ok) {
      const body = await res.text().catch(()=>null);
      console.error('Add to cart error', res.status, body);
      showNotification('Failed to add to cart', 'error');
      if (btn) { btn.disabled = false; btn.innerText = btn.dataset.origText || 'Add to Cart'; }
      return;
    }

    showNotification('Added to cart', 'success');

    // update header count and notify cart page
    if (typeof updateCartCount === 'function') updateCartCount();
    // notify other scripts/pages
    window.dispatchEvent(new CustomEvent('cartChanged', { detail: { productId } }));

    // temporary visual feedback on the button
    if (btn) {
      btn.innerText = 'Added';
      setTimeout(() => {
        btn.disabled = false;
        btn.innerText = btn.dataset.origText || 'Add to Cart';
      }, 1200);
    }

  } catch (err) {
    console.error('[error] Failed to add to cart', err);
    showNotification('Failed to add to cart', 'error');
    const btn = document.querySelector(`button[data-add="${productId}"]`);
    if (btn) { btn.disabled = false; btn.innerText = btn.dataset.origText || 'Add to Cart'; }
  }
}

// Update cart count (uses GET /api/cart)
async function updateCartCount() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  try {
    // use existing apiGet helper which calls `${API_BASE}/api${path}`
    const data = await apiGet('/cart'); // calls GET http://.../api/cart
    const cart = data && data.cart ? data.cart : data;
    const count = cart && cart.totalItems != null ? cart.totalItems : (cart && cart.items ? cart.items.reduce((s,i)=>s+(i.quantity||0),0) : 0);
    el.textContent = count || 0;
  } catch (err) {
    console.error('Cart count error', err);
    el.textContent = '0';
  }
}

// Show Notification (very simple)
function showNotification(message, type = 'info') {
    // fallback simple alert for now
    console.log(`[${type}] ${message}`);
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// small helper to escape text for HTML
function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (s) => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[s]);
}

// expose updateCartCount so other pages/scripts can call it
window.updateCartCount = updateCartCount;
