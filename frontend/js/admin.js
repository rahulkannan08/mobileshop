// Check if user is logged in and is an admin
const APP_API_BASE = (typeof API_BASE !== 'undefined') ? API_BASE : 'http://localhost:5000';
document.addEventListener('DOMContentLoaded', () => {
    // prefer shared helper
    if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login.html?redirect=${redirect}`;
        return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login.html?redirect=${redirect}`;
        return;
    }

    // Verify admin status using backend auth profile
    fetch(`${APP_API_BASE}/api/auth/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(result => {
        const data = result && result.user ? result.user : result;
        // role may be 'admin' or a boolean flag
        const role = data && (data.role || data.userType || data.isAdmin);
        const isAdmin = (role === 'admin') || (data && data.isAdmin === true);
        if (!isAdmin) {
            window.location.href = 'index.html';
            return;
        }
        document.getElementById('admin-name').textContent = (data.firstName || data.name || 'Admin');
        // load admin data (best-effort, handle missing endpoints gracefully)
        loadDashboardData();
        loadProducts();
        loadOrders();
        loadUsers();
        loadCategories();
        loadBrands();
    })
    .catch(err => {
        console.error('Admin auth error', err);
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login.html?redirect=${redirect}`;
    });

    // Add event listeners for navigation
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (e.currentTarget.getAttribute('onclick')) return;
            
            e.preventDefault();
            const section = e.currentTarget.dataset.section;
            showSection(section);
        });
    });
});

function showSection(sectionId) {
    // Update active nav link
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        }
    });

    // Show selected section
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Dashboard Data Loading
function loadDashboardData() {
    const token = localStorage.getItem('token');
    const dateRange = document.getElementById('date-range').value;

    // Load statistics
    fetch(`${APP_API_BASE}/api/admin/dashboard?range=${dateRange}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        // backend returns analytics object
        const analytics = (data && data.analytics) ? data.analytics : data;
        document.getElementById('total-orders').textContent = analytics.totalOrders || 0;
        document.getElementById('total-revenue').textContent = `₹${(analytics.totalRevenue || analytics.totalSales || 0).toLocaleString()}`;
        document.getElementById('total-users').textContent = analytics.totalUsers || 0;
        document.getElementById('total-products').textContent = analytics.totalProducts || 0;

        // Load recent orders and top products where available
        loadRecentOrders();
        loadTopProducts();
    })
    .catch(err => console.error('Error loading dashboard stats:', err));
}

function loadRecentOrders() {
    const token = localStorage.getItem('token');
    fetch(`${APP_API_BASE}/api/admin/recent-orders`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(orders => {
        const container = document.getElementById('recent-orders');
        container.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-info">
                    <h4>Order #${order._id.slice(-6)}</h4>
                    <p>${new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="order-status ${order.status.toLowerCase()}">
                    ${order.status}
                </div>
                <div class="order-amount">
                    ₹${order.totalAmount.toLocaleString()}
                </div>
            </div>
        `).join('');
    })
    .catch(err => console.error('Error loading recent orders:', err));
}

function loadTopProducts() {
    const token = localStorage.getItem('token');
    fetch(`${APP_API_BASE}/api/admin/top-products`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(products => {
        const container = document.getElementById('top-products');
        container.innerHTML = products.map(product => `
            <div class="product-item">
                <img src="${product.images[0]}" alt="${product.name}">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p>${product.totalSold} units sold</p>
                </div>
                <div class="product-revenue">
                    ₹${product.revenue.toLocaleString()}
                </div>
            </div>
        `).join('');
    })
    .catch(err => console.error('Error loading top products:', err));
}

// Products Management
function loadProducts() {
    const token = localStorage.getItem('token');
    fetch(`${APP_API_BASE}/api/products`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(products => {
        const table = document.getElementById('products-table');
        table.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Brand</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(product => `
                        <tr>
                            <td><img src="${product.images[0]}" alt="${product.name}" width="50"></td>
                            <td>${product.name}</td>
                            <td>${product.brand.name}</td>
                            <td>${product.category.name}</td>
                            <td>₹${product.price.toLocaleString()}</td>
                            <td>${product.stock}</td>
                            <td>
                                <button onclick="editProduct('${product._id}')" class="btn-icon">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteProduct('${product._id}')" class="btn-icon text-red-500">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    })
    .catch(err => console.error('Error loading products:', err));
}

// Orders Management
function loadOrders() {
    const token = localStorage.getItem('token');
    fetch(`${APP_API_BASE}/api/orders`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(orders => {
        const table = document.getElementById('orders-table');
        table.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>#${order._id.slice(-6)}</td>
                            <td>${order.user.name}</td>
                            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>₹${order.totalAmount.toLocaleString()}</td>
                            <td>
                                <select onchange="updateOrderStatus('${order._id}', this.value)">
                                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </td>
                            <td>
                                <button onclick="viewOrderDetails('${order._id}')" class="btn-icon">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    })
    .catch(err => console.error('Error loading orders:', err));
}

// Users Management
function loadUsers() {
    const token = localStorage.getItem('token');
    fetch(`${APP_API_BASE}/api/admin/users`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(users => {
        const table = document.getElementById('users-table');
        table.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.isAdmin ? 'Admin' : 'Customer'}</td>
                            <td>${user.isActive ? 'Active' : 'Inactive'}</td>
                            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button onclick="toggleUserStatus('${user._id}')" class="btn-icon">
                                    <i class="fas ${user.isActive ? 'fa-ban' : 'fa-check'}"></i>
                                </button>
                                <button onclick="toggleUserRole('${user._id}')" class="btn-icon">
                                    <i class="fas ${user.isAdmin ? 'fa-user' : 'fa-user-shield'}"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    })
    .catch(err => console.error('Error loading users:', err));
}

// Categories Management
function loadCategories() {
    const token = localStorage.getItem('token');
    fetch(`${APP_API_BASE}/api/categories`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(categories => {
        const table = document.getElementById('categories-table');
        table.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Products</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${categories.map(category => `
                        <tr>
                            <td>${category.name}</td>
                            <td>${category.productCount || 0}</td>
                            <td>${new Date(category.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button onclick="editCategory('${category._id}')" class="btn-icon">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteCategory('${category._id}')" class="btn-icon text-red-500">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    })
    .catch(err => console.error('Error loading categories:', err));
}

// Brands Management
function loadBrands() {
    const token = localStorage.getItem('token');
    fetch(`${APP_API_BASE}/api/brands`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(brands => {
        const table = document.getElementById('brands-table');
        table.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Logo</th>
                        <th>Name</th>
                        <th>Products</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${brands.map(brand => `
                        <tr>
                            <td><img src="${brand.logo}" alt="${brand.name}" width="40"></td>
                            <td>${brand.name}</td>
                            <td>${brand.productCount || 0}</td>
                            <td>${new Date(brand.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button onclick="editBrand('${brand._id}')" class="btn-icon">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteBrand('${brand._id}')" class="btn-icon text-red-500">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    })
    .catch(err => console.error('Error loading brands:', err));
}

// Product Management Functions
function showAddProductForm() {
    // Implement modal with product form
    alert('Add product functionality to be implemented');
}

function editProduct(productId) {
    // Implement modal with product form populated with product data
    alert('Edit product functionality to be implemented');
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const token = localStorage.getItem('token');
    fetch(`${APP_API_BASE}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (res.ok) {
            loadProducts();
        } else {
            throw new Error('Failed to delete product');
        }
    })
    .catch(err => console.error('Error deleting product:', err));
}

// Order Management Functions
function viewOrderDetails(orderId) {
    // Implement modal with order details
    alert('View order details functionality to be implemented');
}

function updateOrderStatus(orderId, status) {
    const token = localStorage.getItem('token');
    fetch(`${APP_API_BASE}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to update order status');
        loadOrders();
    })
    .catch(err => console.error('Error updating order status:', err));
}

// User Management Functions
function toggleUserStatus(userId) {
    const token = localStorage.getItem('token');
    fetch(`${APP_API_BASE}/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to toggle user status');
        loadUsers();
    })
    .catch(err => console.error('Error toggling user status:', err));
}

function toggleUserRole(userId) {
    const token = localStorage.getItem('token');
    fetch(`${APP_API_BASE}/api/admin/users/${userId}/toggle-role`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to toggle user role');
        loadUsers();
    })
    .catch(err => console.error('Error toggling user role:', err));
}

// Category Management Functions
function showAddCategoryForm() {
    // Implement modal with category form
    alert('Add category functionality to be implemented');
}

function editCategory(categoryId) {
    // Implement modal with category form populated with category data
    alert('Edit category functionality to be implemented');
}

function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    const token = localStorage.getItem('token');
    fetch(`${APP_API_BASE}/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (res.ok) {
            loadCategories();
        } else {
            throw new Error('Failed to delete category');
        }
    })
    .catch(err => console.error('Error deleting category:', err));
}

// Brand Management Functions
function showAddBrandForm() {
    // Implement modal with brand form
    alert('Add brand functionality to be implemented');
}

function editBrand(brandId) {
    // Implement modal with brand form populated with brand data
    alert('Edit brand functionality to be implemented');
}

function deleteBrand(brandId) {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    const token = localStorage.getItem('token');
    fetch(`${APP_API_BASE}/api/admin/brands/${brandId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (res.ok) {
            loadBrands();
        } else {
            throw new Error('Failed to delete brand');
        }
    })
    .catch(err => console.error('Error deleting brand:', err));
}