// API Configuration
const API_URL = 'http://localhost:5000/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    updateCartCount();
});

// Load Product Details
async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        const data = await response.json();

        if (data.success) {
            displayProduct(data.product);
        } else {
            alert('Product not found');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Error loading product');
    }
}

// Display Product
function displayProduct(product) {
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('main-product-image').src = product.images[0];
    document.getElementById('current-price').textContent = `₹${product.price.toLocaleString()}`;

    if (product.comparePrice) {
        document.getElementById('original-price').textContent = `₹${product.comparePrice.toLocaleString()}`;
        const discount = Math.round((1 - product.price / product.comparePrice) * 100);
        document.getElementById('discount').textContent = `${discount}% OFF`;
    }

    // Display specifications
    const specsTable = document.getElementById('specs-table');
    if (product.specifications) {
        Object.entries(product.specifications).forEach(([key, value]) => {
            if (value) {
                const row = specsTable.insertRow();
                row.innerHTML = `<td>${key}</td><td>${value}</td>`;
            }
        });
    }
}

// Quantity Controls
function increaseQty() {
    const input = document.getElementById('quantity');
    input.value = parseInt(input.value) + 1;
}

function decreaseQty() {
    const input = document.getElementById('quantity');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

// Add to Cart
async function addToCart() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const quantity = parseInt(document.getElementById('quantity').value);

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity })
        });

        const data = await response.json();

        if (data.success) {
            alert('Added to cart!');
            updateCartCount();
        } else {
            alert(data.message || 'Failed to add to cart');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding to cart');
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

// Add to Wishlist
function addToWishlist() {
    alert('Wishlist feature coming soon!');
}
