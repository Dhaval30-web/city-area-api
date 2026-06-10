const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: { type: Number, required: true, index: true },
    name:      { type: String, required: true, trim: true, maxlength: 60 },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, required: true, trim: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

const sanitize = (str) =>
    String(str)
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .trim();

// GET all reviews for a product
router.get('/:productId', async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        if (isNaN(productId) || productId < 1)
            return res.status(400).json({ success: false, message: 'Invalid product ID' });

        const reviews = await Review.find({ productId })
            .sort({ createdAt: -1 })
            .select('name rating comment createdAt')
            .lean();

        const count = reviews.length;
        const avgRating = count
            ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
            : 0;

        res.json({ success: true, reviews, count, avgRating });
    } catch (err) {
        console.error('GET reviews error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST new review
router.post('/:productId', async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        if (isNaN(productId) || productId < 1)
            return res.status(400).json({ success: false, message: 'Invalid product ID' });

        const { name, rating, comment } = req.body;

        if (!name || !rating || !comment)
            return res.status(400).json({ success: false, message: 'All fields are required' });

        const ratingNum = parseInt(rating);
        if (ratingNum < 1 || ratingNum > 5)
            return res.status(400).json({ success: false, message: 'Rating must be 1-5' });

        const review = new Review({
            productId,
            name:    sanitize(name).slice(0, 60),
            rating:  ratingNum,
            comment: sanitize(comment).slice(0, 1000),
        });

        await review.save();

        const allReviews = await Review.find({ productId }).lean();
        const count = allReviews.length;
        const avgRating = Math.round(
            (allReviews.reduce((s, r) => s + r.rating, 0) / count) * 10
        ) / 10;

        res.status(201).json({ success: true, review, count, avgRating });
    } catch (err) {
        console.error('POST review error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;