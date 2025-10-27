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

// GET /api/admin/users
router.get('/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await User.find().select('firstName lastName email role isVerified createdAt');
        const result = users.map(u => ({
            _id: u._id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
            email: u.email,
            isAdmin: u.role === 'admin',
            isActive: !!u.isVerified,
            createdAt: u.createdAt
        }));
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
    }
});

// GET /api/admin/recent-orders
router.get('/recent-orders', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'firstName lastName email');
        const result = recentOrders.map(o => ({
            _id: o._id,
            createdAt: o.createdAt,
            status: o.orderStatus || 'pending',
            totalAmount: o.totalAmount,
            user: {
                name: `${o.userId?.firstName || ''} ${o.userId?.lastName || ''}`.trim(),
                email: o.userId?.email
            }
        }));
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching recent orders', error: error.message });
    }
});

// GET /api/admin/top-products
router.get('/top-products', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const top = await Order.aggregate([
            { $unwind: '$items' },
            { $group: {
                _id: '$items.productId',
                totalSold: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: [ '$items.price', '$items.quantity' ] } }
            }},
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            { $project: {
                _id: '$product._id',
                name: '$product.name',
                images: '$product.images',
                totalSold: 1,
                revenue: 1
            }}
        ]);
        return res.json(top);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching top products', error: error.message });
    }
});

module.exports = router;
module.exports = router;
