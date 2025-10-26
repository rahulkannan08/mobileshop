const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/brands
router.get('/', async (req, res) => {
    try {
        const brands = await Brand.find({ isActive: true });
        res.json({ success: true, brands });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching brands', error: error.message });
    }
});

// POST /api/brands
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const brand = await Brand.create(req.body);
        res.status(201).json({ success: true, message: 'Brand created', brand });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating brand', error: error.message });
    }
});

module.exports = router;