const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String, image: String, quantity: Number, price: Number
    }],
    totalAmount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    shippingAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    shippingAddress: {
        fullName: String, phoneNumber: String, streetAddress: String,
        city: String, state: String, pincode: String, country: String
    },
    billingAddress: {
        fullName: String, phoneNumber: String, streetAddress: String,
        city: String, state: String, pincode: String, country: String
    },
    paymentMethod: { type: String, enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'cod'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    orderStatus: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    trackingNumber: String,
    estimatedDelivery: Date,
    deliveredAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);