const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Login Required!' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id || decoded._id || decoded.userId;
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid Token!' });
    }
};

// GET — poori wishlist
router.get('/', authMiddleware, async (req, res) => {
    try {
        const items = await Wishlist.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, items, count: items.length });
    } catch {
        res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// POST — add karo
router.post('/', authMiddleware, async (req, res) => {
    console.log('POST /wishlist called');
    console.log('Body:', req.body);
    console.log('UserId:', req.userId);

    try {
        const { productId, name, brand, image, oldPrice, newPrice, weightLabel } = req.body;

        if (!productId || !name) {
            return res.status(400).json({ success: false, message: 'ProductId and Name Required!' });
        }

        const existing = await Wishlist.findOne({ userId: req.userId, productId });
        if (existing) {
            return res.json({ success: false, alreadyAdded: true, message: 'Already Added.' });
        }

        const item = await Wishlist.create({
            userId: req.userId, productId, name, brand, image, oldPrice, newPrice, weightLabel
        });

        const count = await Wishlist.countDocuments({ userId: req.userId });
        res.json({ success: true, item, count, message: 'Product Added in Wishlist.' });
    } catch {
        res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// DELETE — hatao
router.delete('/:productId', authMiddleware, async (req, res) => {
    console.log('GET /wishlist called, userId:', req.userId);

    try {
        await Wishlist.findOneAndDelete({
            userId: req.userId,
            productId: Number(req.params.productId)
        });
        const count = await Wishlist.countDocuments({ userId: req.userId });
        res.json({ success: true, count });
    } catch {
        res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

// GET — check karo
router.get('/check/:productId', authMiddleware, async (req, res) => {
    try {
        const exists = await Wishlist.findOne({
            userId: req.userId,
            productId: Number(req.params.productId)
        });
        res.json({ success: true, inWishlist: !!exists });
    } catch {
        res.status(500).json({ success: false, message: 'Server Error!' });
    }
});

module.exports = router;