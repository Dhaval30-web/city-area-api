const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String 
    },
    email: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
    phone: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
    password: { 
        type: String 
    },
    otp: { 
        type: String 
    },
    otpExpiry: { 
        type: Date 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);