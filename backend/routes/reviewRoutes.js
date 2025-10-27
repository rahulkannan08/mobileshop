const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { authenticateToken } = require('../middleware/auth');

// GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).populate('userId', 'firstName lastName').sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching reviews', error: error.message });
    }
});

// POST /api/reviews
router.post('/', authenticateToken, async (req, res) => {
    try {
        const review = await Review.create({ ...req.body, userId: req.user._id });
        res.status(201).json({ success: true, message: 'Review submitted', review });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating review', error: error.message });
    }
});

module.exports = router;