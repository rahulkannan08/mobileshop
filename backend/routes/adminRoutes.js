const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/admin/dashboard
router.get('/dashboard', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const salesData = await Order.aggregate([
            { $match: { orderStatus: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments({ isActive: true });
        const totalUsers = await User.countDocuments({ role: 'customer' });

        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'firstName lastName email');

        res.json({
            success: true,
            analytics: {
                totalSales: salesData[0]?.total || 0,
                totalOrders,
                totalProducts,
                totalUsers,
                recentOrders
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching dashboard', error: error.message });
    }
});

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus }, { new: true });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating order', error: error.message });
    }
});

module.exports = router;