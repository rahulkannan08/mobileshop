const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/products - Get all products with filters
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 12, search, brand, category, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        let query = { isActive: true };

        if (search) query.$text = { $search: search };
        if (brand) query.brandId = brand;
        if (category) query.categoryId = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const products = await Product.find(query)
            .populate('brandId', 'name logo')
            .populate('categoryId', 'name')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        // Map populated fields to match frontend expectations
        const mappedProducts = products.map(p => ({
            ...p,
            brand: p.brandId,
            category: p.categoryId
        }));

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            products: mappedProducts,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalProducts: total
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
    }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('brandId categoryId');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
    }
});

// POST /api/products - Create product (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, message: 'Product created successfully', product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating product', error: error.message });
    }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product updated successfully', product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating product', error: error.message });
    }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting product', error: error.message });
    }
});

module.exports = router;