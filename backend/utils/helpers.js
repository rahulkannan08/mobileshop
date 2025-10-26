exports.generateOrderNumber = () => {
    return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

exports.calculateTax = (amount, taxRate = 0.18) => {
    return amount * taxRate;
};

exports.calculateShipping = (amount, freeShippingThreshold = 500) => {
    return amount > freeShippingThreshold ? 0 : 50;
};

exports.formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
};

exports.slugify = (text) => {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};