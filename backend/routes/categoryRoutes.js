const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message });
    }
});

// POST /api/categories
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, message: 'Category created', category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating category', error: error.message });
    }
});

module.exports = router;