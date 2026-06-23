const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    productId: {
        type: Number,
        required: true,
    },
    name:        { type: String, required: true },
    brand:       { type: String },
    image:       { type: String },
    oldPrice:    { type: Number },
    newPrice:    { type: Number },
    weightLabel: { type: String },
}, { timestamps: true });

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);