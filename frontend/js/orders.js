// API Configuration
const API_URL = 'http://localhost:5000/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeView();
    updateCartCount();
});

// Check Authentication
function checkAuth() {
    // prefer shared helper if available
    if (typeof isAuthenticated === 'function') {
        if (!isAuthenticated()) {
            const redirect = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `login.html?redirect=${redirect}`;
        }
        return;
    }
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login.html?redirect=${redirect}`;
    }
}

// Initialize View
function initializeView() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    const orderNumber = urlParams.get('order');

    if (orderId) {
        loadOrderDetails(orderId);
    } else if (orderNumber) {
        searchOrderByNumber(orderNumber);
    } else {
        loadOrders();
    }
}

// Load Orders List
async function loadOrders(statusFilter = '') {
    const token = localStorage.getItem('token');

    try {
        let url = `${API_URL}/orders`;
        if (statusFilter) {
            url += `?status=${statusFilter}`;
        }

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            displayOrders(data.orders);
        } else {
            showNotification('Failed to load orders', 'error');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Error loading orders', 'error');
    }
}

// Display Orders
function displayOrders(orders) {
    const ordersGrid = document.getElementById('orders-grid');
    const noOrders = document.getElementById('no-orders');

    if (!orders || orders.length === 0) {
        ordersGrid.classList.add('hidden');
        noOrders.classList.remove('hidden');
        return;
    }

    noOrders.classList.add('hidden');
    ordersGrid.classList.remove('hidden');

    ordersGrid.innerHTML = orders.map(order => `
        <div class="order-card" onclick="viewOrder('${order._id}')">
            <div class="order-card-header">
                <div>
                    <div class="order-number">#${order.orderNumber}</div>
                    <div class="order-date">${formatDate(order.createdAt)}</div>
                </div>
                <span class="status-badge status-${order.orderStatus.toLowerCase()}">
                    ${capitalizeFirst(order.orderStatus)}
                </span>
            </div>
            <div class="order-products">
                ${order.items.map(item => `
                    <img src="${item.image}" alt="${item.name}" class="product-thumb">
                `).join('')}
            </div>
            <div class="order-footer">
                <span class="order-total">₹${order.totalAmount.toLocaleString()}</span>
                <button class="btn-view" onclick="viewOrder('${order._id}', event)">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Load Order Details
async function loadOrderDetails(orderId) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            displayOrderDetails(data.order);
        } else {
            showNotification('Failed to load order details', 'error');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showNotification('Error loading order details', 'error');
    }
}

// Display Order Details
function displayOrderDetails(order) {
    document.getElementById('orders-list-view').classList.add('hidden');
    document.getElementById('order-details').classList.remove('hidden');

    // Order Header
    document.getElementById('order-number').textContent = order.orderNumber;
    document.getElementById('order-date').textContent = formatDate(order.createdAt);
    document.getElementById('current-status').className = `status-badge status-${order.orderStatus.toLowerCase()}`;
    document.getElementById('current-status').textContent = capitalizeFirst(order.orderStatus);

    // Tracking Timeline
    const timeline = document.getElementById('tracking-timeline');
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(order.orderStatus);

    timeline.innerHTML = statuses.map((status, index) => `
        <div class="timeline-item ${index <= currentIndex ? 'active' : ''}">
            <div class="timeline-content">
                <h4>${capitalizeFirst(status)}</h4>
                ${index <= currentIndex ? `
                    <div class="timeline-date">
                        ${index === currentIndex ? formatDate(order.updatedAt) : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');

    // Shipping Address
    const shippingAddress = document.getElementById('shipping-address');
    shippingAddress.innerHTML = `
        <p><strong>${order.shippingAddress.fullName}</strong></p>
        <p>${order.shippingAddress.streetAddress}</p>
        <p>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
        <p>Phone: ${order.shippingAddress.phoneNumber}</p>
    `;

    // Order Items
    const orderItems = document.getElementById('order-items');
    orderItems.innerHTML = order.items.map(item => `
        <div class="item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <div class="item-price">₹${(item.price * item.quantity).toLocaleString()}</div>
        </div>
    `).join('');

    // Payment Details
    const paymentDetails = document.getElementById('payment-details');
    paymentDetails.innerHTML = `
        <table>
            <tr>
                <td>Payment Method</td>
                <td>${capitalizeFirst(order.paymentMethod)}</td>
            </tr>
            <tr>
                <td>Payment Status</td>
                <td>${capitalizeFirst(order.paymentStatus)}</td>
            </tr>
            <tr>
                <td>Subtotal</td>
                <td>₹${(order.totalAmount - order.taxAmount - order.shippingAmount).toLocaleString()}</td>
            </tr>
            <tr>
                <td>Tax (18%)</td>
                <td>₹${order.taxAmount.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Shipping</td>
                <td>${order.shippingAmount === 0 ? 'FREE' : `₹${order.shippingAmount}`}</td>
            </tr>
            <tr>
                <td>Total</td>
                <td>₹${order.totalAmount.toLocaleString()}</td>
            </tr>
        </table>
    `;
}

// View Order
function viewOrder(orderId, event) {
    if (event) {
        event.stopPropagation();
    }
    window.history.pushState({}, '', `orders.html?id=${orderId}`);
    loadOrderDetails(orderId);
}

// Show Orders List
function showOrdersList() {
    window.history.pushState({}, '', 'orders.html');
    document.getElementById('order-details').classList.add('hidden');
    document.getElementById('orders-list-view').classList.remove('hidden');
    loadOrders(document.getElementById('status-filter').value);
}

// Filter Orders
function filterOrders() {
    const status = document.getElementById('status-filter').value;
    loadOrders(status);
}

// Search Order by Number
async function searchOrderByNumber(orderNumber) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/orders/search?orderNumber=${orderNumber}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success && data.order) {
            displayOrderDetails(data.order);
        } else {
            showNotification('Order not found', 'error');
            loadOrders();
        }
    } catch (error) {
        console.error('Error searching order:', error);
        showNotification('Error searching order', 'error');
        loadOrders();
    }
}

// Update Cart Count
async function updateCartCount() {
    const token = localStorage.getItem('token');
    const cartCountEl = document.getElementById('cart-count');
    if (!token || !cartCountEl) return;

    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.cart) {
            cartCountEl.textContent = data.cart.totalItems || 0;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Helper Functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}