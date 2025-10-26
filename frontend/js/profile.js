// API Configuration
const API_URL = 'http://localhost:5000/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserProfile();
    initializeEventListeners();
    loadAddresses();
    loadOrders();
    updateCartCount();
});

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// Load User Profile
async function loadUserProfile() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            displayUserProfile(data.user);
        } else {
            showNotification('Failed to load profile', 'error');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Error loading profile', 'error');
    }
}

// Display User Profile
function displayUserProfile(user) {
    document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('firstName').value = user.firstName;
    document.getElementById('lastName').value = user.lastName;
    document.getElementById('email').value = user.email;
    document.getElementById('phoneNumber').value = user.phoneNumber || '';
    document.getElementById('dateOfBirth').value = user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '';
    document.getElementById('gender').value = user.gender || '';
}

// Load Addresses
async function loadAddresses() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/users/addresses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            displayAddresses(data.addresses);
        }
    } catch (error) {
        console.error('Error loading addresses:', error);
    }
}

// Display Addresses
function displayAddresses(addresses) {
    const container = document.getElementById('addresses-list');
    
    if (!addresses || addresses.length === 0) {
        container.innerHTML = '<p class="no-data">No saved addresses</p>';
        return;
    }

    container.innerHTML = addresses.map(address => `
        <div class="address-card">
            <div class="actions">
                <button onclick="editAddress('${address._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteAddress('${address._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <h4>${address.type.toUpperCase()}</h4>
            <p>${address.fullName}</p>
            <p>${address.streetAddress}</p>
            <p>${address.city}, ${address.state} - ${address.pincode}</p>
            <p>Phone: ${address.phoneNumber}</p>
        </div>
    `).join('');
}

// Load Orders
async function loadOrders() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            displayOrders(data.orders);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Display Orders
function displayOrders(orders) {
    const container = document.getElementById('orders-list');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p class="no-data">No orders found</p>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <h4>Order #${order.orderNumber}</h4>
                    <p>Placed on ${new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span class="order-status status-${order.orderStatus}">${order.orderStatus}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.name}">
                        <span>₹${item.price.toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <p>Total: ₹${order.totalAmount.toLocaleString()}</p>
                <button class="btn-link" onclick="viewOrder('${order._id}')">View Details</button>
            </div>
        </div>
    `).join('');
}

// Initialize Event Listeners
function initializeEventListeners() {
    // Tab Navigation
    const tabLinks = document.querySelectorAll('.profile-nav a[data-tab]');
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(e.target.dataset.tab);
        });
    });

    // Profile Form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
    }

    // Password Form
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', updatePassword);
    }

    // Cart Button
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => window.location.href = 'cart.html');
    }
}

// Switch Tab
function switchTab(tabId) {
    // Update navigation
    document.querySelectorAll('.profile-nav a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`.profile-nav a[data-tab="${tabId}"]`).classList.add('active');

    // Update sections
    document.querySelectorAll('.profile-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
}

// Update Profile
async function updateProfile(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const profileData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value
    };

    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Profile updated successfully', 'success');
            loadUserProfile();
        } else {
            showNotification(data.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile', 'error');
    }
}

// Update Password
async function updatePassword(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Password updated successfully', 'success');
            document.getElementById('password-form').reset();
        } else {
            showNotification(data.message || 'Failed to update password', 'error');
        }
    } catch (error) {
        console.error('Error updating password:', error);
        showNotification('Error updating password', 'error');
    }
}

// View Order Details
function viewOrder(orderId) {
    window.location.href = `orders.html?id=${orderId}`;
}

// Show/Hide Address Form
function showAddAddressForm() {
    document.getElementById('address-form-container').classList.remove('hidden');
}

// Delete Address
async function deleteAddress(addressId) {
    if (!confirm('Are you sure you want to delete this address?')) return;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/users/addresses/${addressId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Address deleted successfully', 'success');
            loadAddresses();
        } else {
            showNotification(data.message || 'Failed to delete address', 'error');
        }
    } catch (error) {
        console.error('Error deleting address:', error);
        showNotification('Error deleting address', 'error');
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

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
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