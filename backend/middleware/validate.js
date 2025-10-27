const { body, validationResult } = require('express-validator');

exports.validateProduct = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('brandId').notEmpty().withMessage('Brand is required'),
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('sku').trim().notEmpty().withMessage('SKU is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

exports.validateOrder = [
    body('shippingAddress.fullName').notEmpty(),
    body('shippingAddress.phoneNumber').isMobilePhone(),
    body('shippingAddress.pincode').isLength({ min: 6, max: 6 }),
    body('paymentMethod').isIn(['cod', 'credit_card', 'debit_card', 'upi']),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];