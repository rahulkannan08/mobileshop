const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

// GET /api/cart
router.get('/', authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
        res.json({ success: true, cart: cart || { items: [], totalItems: 0, totalAmount: 0 } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching cart', error: error.message });
    }
});

// POST /api/cart/add
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        let cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            cart = new Cart({ userId: req.user._id, items: [] });
        }

        const existingItem = cart.items.find(item => item.productId.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ productId, quantity, price: product.price });
        }

        cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cart.lastModified = new Date();

        await cart.save();
        res.json({ success: true, message: 'Item added to cart', cart });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding to cart', error: error.message });
    }
});

// PUT /api/cart/update
router.put('/update', authenticateToken, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const item = cart.items.find(item => item.productId.toString() === productId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }

        item.quantity = quantity;
        cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        await cart.save();
        res.json({ success: true, message: 'Cart updated', cart });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating cart', error: error.message });
    }
});

// DELETE /api/cart/remove
router.delete('/remove', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.body;
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        await cart.save();
        res.json({ success: true, message: 'Item removed from cart', cart });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error removing from cart', error: error.message });
    }
});

// DELETE /api/cart/clear
router.delete('/clear', authenticateToken, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ userId: req.user._id });
        res.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error clearing cart', error: error.message });
    }
});

module.exports = router;