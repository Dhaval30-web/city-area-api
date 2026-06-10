const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOtp, sendEmailOtp } = require('../utils/sendOtp');

// ==================== SIGNUP ====================
router.post('/signup', async (req, res) => {
    try {
        const { name, emailOrPhone, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match!' });
        }

        const isEmail = emailOrPhone.includes('@');

        // Phone ke multiple formats check karo
        let existingUser;
        if (isEmail) {
            existingUser = await User.findOne({ email: emailOrPhone });
        } else {
            existingUser = await User.findOne({
                $or: [
                    { phone: emailOrPhone },
                    { phone: '+91' + emailOrPhone },
                    { phone: emailOrPhone.replace('+91', '') }
                ]
            });
        }

        if (existingUser) {
            return res.status(400).json({ 
                message: 'Account already exists! Please login first.' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        const user = new User({
            name,
            email: isEmail ? emailOrPhone : undefined,
            phone: !isEmail ? emailOrPhone : undefined,
            password: hashedPassword,
            otp,
            otpExpiry,
            isVerified: false
        });

        await user.save();

        if (isEmail) {
            // Email OTP bhejo
            await sendEmailOtp(emailOrPhone, otp);
            res.status(200).json({ 
                message: 'OTP sent to your email!',
                userId: user._id,
                otpRequired: true
            });
        } else {
            // Phone ke liye abhi Twilio nahi hai
            // Directly verify kar do aur OTP console mein dikhao
            console.log(`📱 Phone OTP for ${emailOrPhone}: ${otp}`);
            res.status(200).json({ 
                message: 'OTP sent! (Check server console for phone OTP)',
                userId: user._id,
                otpRequired: true,
                // Development ke liye OTP response mein bhej rahe hain
                devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
            });
        }

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==================== VERIFY OTP ====================
router.post('/verify-otp', async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ message: 'User not found!' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP!' });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'OTP expired! Please try again.' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(200).json({ 
            message: 'Account verified successfully!',
            token,
            user: { name: user.name, email: user.email, phone: user.phone }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;

        const isEmail = emailOrPhone.includes('@');

        // Phone ke multiple formats check karo
        let user;
        if (isEmail) {
            user = await User.findOne({ email: emailOrPhone });
        } else {
            user = await User.findOne({
                $or: [
                    { phone: emailOrPhone },
                    { phone: '+91' + emailOrPhone },
                    { phone: emailOrPhone.replace('+91', '') }
                ]
            });
        }

        if (!user) {
            return res.status(400).json({ 
                message: 'Account not found! Please signup first.' 
            });
        }

        if (!user.isVerified) {
            return res.status(400).json({ 
                message: 'Please verify your account first! Check your email/phone for OTP.' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password!' });
        }

        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(200).json({ 
            message: 'Login successful!',
            token,
            user: { name: user.name, email: user.email, phone: user.phone }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==================== FORGOT PASSWORD ====================
router.post('/forgot-password', async (req, res) => {
    try {
        const { emailOrPhone } = req.body;

        const isEmail = emailOrPhone.includes('@');

        let user;
        if (isEmail) {
            user = await User.findOne({ email: emailOrPhone });
        } else {
            user = await User.findOne({
                $or: [
                    { phone: emailOrPhone },
                    { phone: '+91' + emailOrPhone },
                    { phone: emailOrPhone.replace('+91', '') }
                ]
            });
        }

        if (!user) {
            return res.status(400).json({ message: 'Account not found!' });
        }

        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        if (isEmail) {
            await sendEmailOtp(emailOrPhone, otp);
        } else {
            console.log(`📱 Reset OTP for ${emailOrPhone}: ${otp}`);
        }

        res.status(200).json({ 
            message: isEmail ? 'OTP sent to your email!' : 'OTP sent! (Check server console)',
            userId: user._id,
            devOtp: !isEmail && process.env.NODE_ENV !== 'production' ? otp : undefined
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==================== RESET PASSWORD ====================
router.post('/reset-password', async (req, res) => {
    try {
        const { userId, otp, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match!' });
        }

        const user = await User.findById(userId);

        if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP!' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully!' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;