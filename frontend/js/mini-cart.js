// Mini cart: renders a dropdown near the header cart icon and refreshes on cartChanged/authChanged

const MINI_CART_BASE = (typeof API_BASE !== 'undefined') ? API_BASE : 'http://localhost:5000';

function getStoredToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
}

async function fetchCartData() {
  try {
    const token = getStoredToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await fetch(`${MINI_CART_BASE}/api/cart`, { method: 'GET', headers });
    if (!res.ok) {
      // return empty shape for UI
      return { items: [], totalItems: 0, totalAmount: 0, errorStatus: res.status };
    }
    const data = await res.json().catch(()=>({}));
    return data.cart || data || { items: [], totalItems: 0, totalAmount: 0 };
  } catch (err) {
    console.error('fetchCartData error', err);
    return { items: [], totalItems: 0, totalAmount: 0 };
  }
}

function formatPrice(amount) {
  if (amount == null) return '₹0.00';
  // backend stores price in minor units? try to detect: if large assume rupees already
  const n = Number(amount);
  const display = n > 10000 ? n : n / 100;
  return '₹' + display.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function createMiniCartMarkup(cart) {
  if (!cart || !cart.items || cart.items.length === 0) {
    return `<div class="mini-cart-empty">Your cart is empty.<div class="mini-cart-actions"><a href="index.html" class="btn">Shop now</a></div></div>`;
  }

  const itemsHtml = cart.items.slice(0,6).map(it => {
    const p = it.productId || it.product || {};
    const img = (p.images && p.images[0]) || 'images/placeholder.jpg';
    const name = p.name || p.title || 'Product';
    const qty = it.quantity || 1;
    const price = (it.price != null) ? it.price : (p.price != null ? p.price : 0);
    return `
      <div class="mini-cart-item" data-id="${it.productId}">
        <img src="${img}" class="mini-cart-img" alt="${escapeHtml(name)}">
        <div class="mini-cart-item-info">
          <div class="mini-cart-name">${escapeHtml(name)}</div>
          <div class="mini-cart-meta">Qty: ${qty} · ${formatPrice(price)}</div>
        </div>
      </div>
    `;
  }).join('');

  const subtotal = cart.totalAmount != null ? cart.totalAmount : cart.items.reduce((s,i)=>s + ((i.price||0)*(i.quantity||1)), 0);

  return `
    <div class="mini-cart-list">
      ${itemsHtml}
    </div>
    <div class="mini-cart-summary">
      <div class="mini-sub">Subtotal: <strong>${formatPrice(subtotal)}</strong></div>
      <div class="mini-cart-actions">
        <a href="cart.html" class="btn btn-primary">View Cart</a>
        <a href="checkout.html" class="btn">Checkout</a>
      </div>
    </div>
  `;
}

function ensureMiniCartContainer() {
  let container = document.getElementById('mini-cart-dropdown');
  if (container) return container;

  container = document.createElement('div');
  container.id = 'mini-cart-dropdown';
  container.style.position = 'absolute';
  container.style.minWidth = '320px';
  container.style.maxWidth = '420px';
  container.style.right = '12px';
  container.style.top = '56px';
  container.style.zIndex = '9999';
  container.style.background = '#fff';
  container.style.border = '1px solid rgba(0,0,0,0.08)';
  container.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
  container.style.borderRadius = '8px';
  container.style.padding = '12px';
  container.style.display = 'none';
  container.innerHTML = '<div class="mini-cart-loading">Loading...</div>';
  document.body.appendChild(container);
  return container;
}

async function showMiniCart() {
  const container = ensureMiniCartContainer();
  container.style.display = 'block';
  container.innerHTML = '<div class="mini-cart-loading">Loading...</div>';

  const cart = await fetchCartData();
  container.innerHTML = createMiniCartMarkup(cart);
}

function hideMiniCart() {
  const container = document.getElementById('mini-cart-dropdown');
  if (container) container.style.display = 'none';
}

function positionMiniCartNear(target) {
  const container = ensureMiniCartContainer();
  const rect = target.getBoundingClientRect();
  container.style.top = (rect.bottom + window.scrollY + 8) + 'px';
  container.style.right = (window.innerWidth - rect.right - 8) + 'px';
}

function toggleMiniCart(e) {
  const container = ensureMiniCartContainer();
  if (container.style.display === 'block') {
    hideMiniCart();
    return;
  }
  const target = e.currentTarget || e.target;
  positionMiniCartNear(target);
  showMiniCart();
}

function findCartToggleElement() {
  // prefer element with id 'cart-btn', else any element that contains #cart-count span
  let el = document.getElementById('cart-btn');
  if (el) return el;
  const countEl = document.getElementById('cart-count') || document.querySelector('.cart-count');
  if (countEl) {
    // find clickable parent
    let p = countEl;
    while (p && p !== document.body) {
      if (p.tagName === 'A' || p.tagName === 'BUTTON' || p.onclick) return p;
      p = p.parentElement;
    }
  }
  // fallback: find any .icon-btn with cart icon
  return document.querySelector('.icon-btn .fa-shopping-cart')?.parentElement || null;
}

function installMiniCart() {
  const toggleEl = findCartToggleElement();
  if (!toggleEl) return;

  // attach click to toggle
  toggleEl.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMiniCart(e);
  });

  // close on outside click
  document.addEventListener('click', (ev) => {
    const container = document.getElementById('mini-cart-dropdown');
    if (!container) return;
    if (container.contains(ev.target)) return;
    if (toggleEl.contains(ev.target)) return;
    hideMiniCart();
  });

  // refresh on cart changes or auth changes
  window.addEventListener('cartChanged', () => {
    // update count and refresh dropdown if open
    if (typeof updateCartCount === 'function') updateCartCount();
    const container = document.getElementById('mini-cart-dropdown');
    if (container && container.style.display === 'block') showMiniCart();
  });
  window.addEventListener('authChanged', () => {
    if (typeof updateCartCount === 'function') updateCartCount();
    const container = document.getElementById('mini-cart-dropdown');
    if (container && container.style.display === 'block') showMiniCart();
  });
}

// start when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  installMiniCart();
});