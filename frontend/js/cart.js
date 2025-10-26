// API Configuration
const API_URL = 'http://localhost:5000/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});

// reload cart when other scripts dispatch the event
window.addEventListener('cartChanged', () => {
  // if cart page open, refresh contents
  if (document.readyState === 'complete') loadCart();
});

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// Format Currency
function formatCurrency(amount) {
    // amount expected in minor units (cents) or as number; handle both
    if (amount == null) return '₹0';
    const v = (Number(amount) / 100);
    return '₹' + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Load Cart
async function loadCart() {
    const elItems = document.getElementById('cart-items');
    const elSubtotal = document.getElementById('subtotal');
    const elTax = document.getElementById('tax');
    const elShipping = document.getElementById('shipping');
    const elTotal = document.getElementById('total');

    if (!elItems) return;

    elItems.innerHTML = '<p class="loading">Loading cart...</p>';

    try {
        const token = getStoredToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${API_URL}/cart`, { method: 'GET', headers });

        if (res.status === 401) {
            elItems.innerHTML = '<p class="error">Please login to view your cart.</p>';
            elSubtotal.textContent = elTax.textContent = elShipping.textContent = elTotal.textContent = '₹0';
            return;
        }

        if (!res.ok) {
            elItems.innerHTML = '<p class="error">Failed to load cart.</p>';
            return;
        }

        const data = await res.json().catch(()=>({}));
        const cart = data && data.cart ? data.cart : (data || { items: [], totalItems: 0, totalAmount: 0 });

        if (!cart.items || cart.items.length === 0) {
            elItems.innerHTML = '<p class="empty">Your cart is empty. <a href="index.html">Shop now</a></p>';
            elSubtotal.textContent = elTax.textContent = elShipping.textContent = elTotal.textContent = '₹0';
            // update header count
            if (window.updateCartCount) window.updateCartCount();
            return;
        }

        // render items
        elItems.innerHTML = cart.items.map(item => {
            const prod = item.productId || item.product || {};
            const img = (prod.images && prod.images[0]) || 'images/placeholder.jpg';
            const name = prod.name || prod.title || 'Product';
            const brand = prod.brandId?.name || prod.brand || '';
            const price = item.price != null ? item.price : (prod.price != null ? prod.price : 0);
            const qty = item.quantity || 1;
            return `
                <div class="cart-item" data-product="${item.productId}">
                    <div class="cart-item-image"><img src="${img}" alt="${escapeHtml(name)}"></div>
                    <div class="cart-item-info">
                        <h4>${escapeHtml(name)}</h4>
                        <div class="cart-item-meta">${escapeHtml(brand)}</div>
                        <div class="cart-item-controls">
                            <div class="price">${formatCurrency(price)}</div>
                            <div class="qty-controls">
                                <button class="qty-decrease" data-id="${item.productId}">-</button>
                                <input class="qty-input" data-id="${item.productId}" value="${qty}" type="number" min="1">
                                <button class="qty-increase" data-id="${item.productId}">+</button>
                            </div>
                            <button class="btn-remove" data-id="${item.productId}">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // summary
        const subtotal = cart.totalAmount != null ? cart.totalAmount : cart.items.reduce((s,i)=>s + ((i.price||0) * (i.quantity||1)), 0);
        const tax = Math.round(subtotal * 0.18); // 18% tax
        const shipping = 0;
        const total = subtotal + tax + shipping;

        elSubtotal.textContent = formatCurrency(subtotal);
        elTax.textContent = formatCurrency(tax);
        elShipping.textContent = formatCurrency(shipping);
        elTotal.textContent = formatCurrency(total);

        // attach listeners
        document.querySelectorAll('.qty-decrease').forEach(btn => btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const input = document.querySelector(`.qty-input[data-id="${id}"]`);
            const value = Math.max(1, (Number(input.value) || 1) - 1);
            input.value = value;
            updateQuantity(id, value);
        }));
        document.querySelectorAll('.qty-increase').forEach(btn => btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const input = document.querySelector(`.qty-input[data-id="${id}"]`);
            const value = (Number(input.value) || 1) + 1;
            input.value = value;
            updateQuantity(id, value);
        }));
        document.querySelectorAll('.qty-input').forEach(inp => inp.addEventListener('change', (e) => {
            const id = e.currentTarget.dataset.id;
            let value = Math.max(1, Number(e.currentTarget.value) || 1);
            e.currentTarget.value = value;
            updateQuantity(id, value);
        }));
        document.querySelectorAll('.btn-remove').forEach(btn => btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            removeItem(id);
        }));

        // update header count
        if (window.updateCartCount) window.updateCartCount();
    } catch (err) {
        console.error('loadCart error', err);
        elItems.innerHTML = '<p class="error">Error loading cart.</p>';
    }
}

async function updateQuantity(productId, quantity) {
    try {
        const token = getStoredToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/cart/update`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ productId, quantity })
        });

        if (!res.ok) {
            console.error('updateQuantity failed', await res.text().catch(()=>null));
            return;
        }
        // refresh
        await loadCart();
    } catch (err) {
        console.error('updateQuantity error', err);
    }
}

async function removeItem(productId) {
    try {
        const token = getStoredToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/cart/remove`, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ productId })
        });

        if (!res.ok) {
            console.error('removeItem failed', await res.text().catch(()=>null));
            return;
        }
        await loadCart();
    } catch (err) {
        console.error('removeItem error', err);
    }
}

function proceedToCheckout() {
    // simple redirect - implement checkout flow as needed
    window.location.href = 'checkout.html';
}
