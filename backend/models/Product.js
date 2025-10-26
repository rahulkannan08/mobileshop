const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 500 },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    sku: { type: String, unique: true, required: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    images: [{ type: String, required: true }],
    specifications: {
        display: String, processor: String, ram: String, storage: String,
        rearCamera: String, frontCamera: String, battery: String, os: String,
        connectivity: [String], dimensions: String, color: [String]
    },
    features: [String],
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    tags: [String],
    warranty: String
}, { timestamps: true });

productSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }
    next();
});

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);