const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    comment: { type: String, required: true },
    images: [String],
    isVerified: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 }
}, { timestamps: true });

reviewSchema.post('save', async function() {
    const Product = mongoose.model('Product');
    const reviews = await this.constructor.find({ productId: this.productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(this.productId, {
        averageRating: avgRating.toFixed(1),
        totalReviews: reviews.length
    });
});

module.exports = mongoose.model('Review', reviewSchema);