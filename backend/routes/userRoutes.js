const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Placeholder for additional user routes
router.get('/test', authenticateToken, (req, res) => {
    res.json({ success: true, message: 'User routes working', user: req.user });
});

module.exports = router;