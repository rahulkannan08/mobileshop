const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

// POST /api/orders - Create order
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { shippingAddress, billingAddress, paymentMethod } = req.body;
        const userId = req.user._id;

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const subtotal = cart.totalAmount;
        const taxAmount = subtotal * 0.18;
        const shippingAmount = subtotal > 500 ? 0 : 50;
        const totalAmount = subtotal + taxAmount + shippingAmount;

        const orderNumber = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

        const order = new Order({
            orderNumber,
            userId,
            items: cart.items.map(item => ({
                productId: item.productId._id,
                name: item.productId.name,
                image: item.productId.images[0],
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
            taxAmount,
            shippingAmount,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            paymentMethod,
            orderStatus: 'pending',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed'
        });

        await order.save();

        for (let item of cart.items) {
            await Product.findByIdAndUpdate(item.productId._id, {
                $inc: { stockQuantity: -item.quantity }
            });
        }

        await Cart.findOneAndDelete({ userId });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: { _id: order._id, orderNumber: order.orderNumber, totalAmount: order.totalAmount }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating order', error: error.message });
    }
});

// GET /api/orders - Get user orders
router.get('/', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
    }
});

// GET /api/orders/:id - Get order details
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('userId');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching order', error: error.message });
    }
});

module.exports = router;