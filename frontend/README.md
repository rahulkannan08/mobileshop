# Mobile Shop - Frontend

Complete frontend package for the Mobile Shop e-commerce platform.

## 📦 What's Included

### HTML Pages (9 files)
- index.html - Homepage with product catalog
- login.html - User login
- register.html - User registration
- product.html - Product details
- cart.html - Shopping cart
- checkout.html - Checkout (coming soon)
- profile.html - User profile (coming soon)
- orders.html - Order history (coming soon)
- admin.html - Admin dashboard (coming soon)

### CSS Files (6 files)
- css/style.css - Main styles
- css/auth.css - Login/Register styles
- css/product.css - Product page styles
- css/cart.css - Cart page styles
- css/profile.css - Profile styles (coming soon)
- css/admin.css - Admin styles (coming soon)

### JavaScript Files (8 files)
- js/script.js - Homepage logic
- js/auth.js - Authentication
- js/product.js - Product details
- js/cart.js - Cart management
- js/checkout.js - Checkout (coming soon)
- js/profile.js - Profile management (coming soon)
- js/orders.js - Orders (coming soon)
- js/admin.js - Admin (coming soon)

## 🚀 Setup

1. **Extract this folder**
2. **Update API URL** in all JS files:
   ```javascript
   const API_URL = 'http://localhost:5000/api';
   ```
3. **Open in browser** or use a local server:
   ```bash
   # Using Python
   python -m http.server 3000

   # Using Node.js
   npx http-server -p 3000

   # Using VS Code
   Install "Live Server" extension and right-click index.html
   ```

## 🔗 Connect to Backend

Make sure your backend is running on `http://localhost:5000`

Update the API_URL in these files if your backend is on a different URL:
- js/script.js
- js/auth.js
- js/product.js
- js/cart.js

## ✅ Features

- ✅ Responsive design
- ✅ User authentication (login/register)
- ✅ Product catalog with filters
- ✅ Product search
- ✅ Product details page
- ✅ Shopping cart
- ✅ Cart management
- ⏳ Checkout (integrate with backend)
- ⏳ User profile
- ⏳ Order tracking
- ⏳ Admin dashboard

## 📱 Responsive Design

All pages work on:
- Desktop (1920px+)
- Laptop (1366px+)
- Tablet (768px+)
- Mobile (375px+)

## 🎨 Customization

### Change Colors
Edit CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #1e40af;
    /* ... more colors */
}
```

### Add Pages
Follow the existing pattern in HTML files and create corresponding JS files.

## 🔧 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📚 Next Steps

1. Complete remaining pages (checkout, profile, orders, admin)
2. Add more product filters
3. Implement wishlist
4. Add product comparison
5. Integrate payment gateway
6. Add reviews display

## 🐛 Troubleshooting

**Products not loading:**
- Check backend is running
- Verify API_URL in JS files
- Check browser console for errors

**Can't login:**
- Verify backend auth routes are working
- Check credentials
- Clear localStorage and try again

**Cart not working:**
- Make sure you're logged in
- Check token in localStorage
- Verify backend cart routes

## 📄 License

MIT License - Free to use
