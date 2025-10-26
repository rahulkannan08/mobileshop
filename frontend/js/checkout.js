// API Configuration
const API_URL = 'http://localhost:5000/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCart();
    loadSavedAddresses();
    initializeEventListeners();
});

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// Load Cart Summary
async function loadCart() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            displayOrderSummary(data.cart);
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        showNotification('Error loading cart details', 'error');
    }
}

// Display Order Summary
function displayOrderSummary(cart) {
    const orderItemsContainer = document.getElementById('order-items');
    
    if (!cart || cart.items.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    orderItemsContainer.innerHTML = cart.items.map(item => `
        <div class="order-item">
            <img src="${item.productId.images[0]}" alt="${item.productId.name}">
            <div class="item-details">
                <h4>${item.productId.name}</h4>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <div class="item-price">₹${(item.price * item.quantity).toLocaleString()}</div>
        </div>
    `).join('');

    const subtotal = cart.totalAmount;
    const tax = subtotal * 0.18;
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shipping;

    document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString()}`;
    document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
    document.getElementById('total').textContent = `₹${total.toLocaleString()}`;
}

// Load Saved Addresses
async function loadSavedAddresses() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/users/addresses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            displaySavedAddresses(data.addresses);
        }
    } catch (error) {
        console.error('Error loading addresses:', error);
    }
}

// Display Saved Addresses
function displaySavedAddresses(addresses) {
    const container = document.getElementById('saved-addresses');
    if (!addresses || addresses.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.innerHTML = addresses.map(address => `
        <div class="saved-address-card" onclick="selectAddress(this)" data-address='${JSON.stringify(address)}'>
            <h4>${address.fullName}</h4>
            <p>${address.streetAddress}</p>
            <p>${address.city}, ${address.state} - ${address.pincode}</p>
            <p>Phone: ${address.phoneNumber}</p>
        </div>
    `).join('');
}

// Select Saved Address
function selectAddress(element) {
    const addressCards = document.querySelectorAll('.saved-address-card');
    addressCards.forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');

    const address = JSON.parse(element.dataset.address);
    fillAddressForm(address);
}

// Fill Address Form
function fillAddressForm(address) {
    document.getElementById('fullName').value = address.fullName;
    document.getElementById('phoneNumber').value = address.phoneNumber;
    document.getElementById('streetAddress').value = address.streetAddress;
    document.getElementById('landmark').value = address.landmark || '';
    document.getElementById('city').value = address.city;
    document.getElementById('state').value = address.state;
    document.getElementById('pincode').value = address.pincode;
}

// Initialize Event Listeners
function initializeEventListeners() {
    const addressForm = document.getElementById('address-form');
    if (addressForm) {
        addressForm.addEventListener('submit', handleAddressSubmit);
    }

    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', togglePaymentForm);
    });
}

// Handle Address Form Submit
function handleAddressSubmit(e) {
    e.preventDefault();
    document.getElementById('address-section').classList.add('hidden');
    document.getElementById('payment-section').classList.remove('hidden');
    document.getElementById('step-payment').classList.add('active');
}

// Toggle Payment Forms
function togglePaymentForm(e) {
    const cardForm = document.getElementById('card-payment-form');
    const upiForm = document.getElementById('upi-payment-form');

    cardForm.classList.add('hidden');
    upiForm.classList.add('hidden');

    if (e.target.value === 'card') {
        cardForm.classList.remove('hidden');
    } else if (e.target.value === 'upi') {
        upiForm.classList.remove('hidden');
    }
}

// Place Order
async function placeOrder() {
    const token = localStorage.getItem('token');
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    const orderData = {
        shippingAddress: {
            fullName: document.getElementById('fullName').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            streetAddress: document.getElementById('streetAddress').value,
            landmark: document.getElementById('landmark').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            pincode: document.getElementById('pincode').value,
            country: 'India'
        },
        paymentMethod,
        saveAddress: document.getElementById('saveAddress').checked
    };

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('step-confirmation').classList.add('active');
            showNotification('Order placed successfully!', 'success');
            setTimeout(() => {
                window.location.href = `orders.html?order=${data.order.orderNumber}`;
            }, 2000);
        } else {
            showNotification(data.message || 'Failed to place order', 'error');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Error placing order. Please try again.', 'error');
    }
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