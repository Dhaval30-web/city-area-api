const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected!'))
    .catch((err) => console.log('DB Error:', err));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const reviewRoutes = require('./routes/review');
app.use('/api/reviews', reviewRoutes);

const cityAreas = {
    Ahmedabad : [
        {id: 1, name: "Akhabarnagar", pincode: "380081"},
        {id: 2, name: "Ranip - New Ranip", pincode: "382480"},
        {id: 3, name: "Gota", pincode: "382481"},
        {id: 4, name: "Jagatpur", pincode: "382470"},
        {id: 5, name: "Madhupura", pincode: "380004"},
        {id: 6, name: "Kalupur", pincode: "380001"},
        {id: 7, name: "Naroda", pincode: "382330"},
        {id: 8, name: "Ghodasar", pincode: "380050"},
        {id: 9, name: "Ishanpur", pincode: "382443"},
        {id: 10, name: "Bapunagar", pincode: "380024"},
        {id: 11, name: "Thaltej", pincode: "380059"},
        {id: 12, name: "Bopal", pincode: "380058"},
        {id: 13, name: "Bodakdev", pincode: "380054"},
        {id: 14, name: "Memnagar", pincode: "380052"},
        {id: 15, name: "Gurukul", pincode: "380052"},
        {id: 16, name: "Godhrej-Garden City", pincode: "382481"},
        {id: 17, name: "Vadaj", pincode: "380013"},
        {id: 18, name: "Jivaraj", pincode: "380051"},
        {id: 19, name: "Vejalpur", pincode: "380051"},
        {id: 20, name: "Paldi", pincode: "380007"},
        {id: 21, name: "Navarangpura", pincode: "380009"},
        {id: 22, name: "Naranpura", pincode: "380013"},
        {id: 22, name: "Shahibaug", pincode: "380016"},
        {id: 23, name: "Law-Garden", pincode: "380006"},
        {id: 24, name: "Sastrinagar", pincode: "380013"},
        {id: 25, name: "Airport", pincode: "380003"},
        {id: 26, name: "Vasna", pincode: "380007"},
        {id: 27, name: "Vadaj", pincode: "380013"},
        {id: 28, name: "Nikol", pincode: "380049"},
        {id: 29, name: "Sindhu-Bhavan", pincode: "380054"},
        {id: 30, name: "Chandkheda", pincode: "382424"},
        {id: 31, name: "Sabarmati", pincode: "380005"},
        {id: 32, name: "Saraspur", pincode: "380018"},
        {id: 33, name: "Hanshpura", pincode: "382330"},
        {id: 34, name: "Shahpur", pincode: "380001"},
    ],

    Gandhinagar : [
        {id: 1, name: "Gandhinagar HO / Secretariat", pincode: "382010"},
        {id: 2, name: "Adalaj", pincode: "382421"},
        {id: 3, name: "Ambapur", pincode: "382421"},
        {id: 4, name: "BSF Campus", pincode: "382045"},
        {id: 5, name: "Kudasan", pincode: "382421"},
        {id: 6, name: "Sargasan", pincode: "382421"},
        {id: 7, name: "Vavol", pincode: "382016"},
        {id: 8, name: "Koba", pincode: "382007"},
        {id: 9, name: "GIFT City", pincode: "382355"},
        {id: 10, name: "Chiloda", pincode: "382355"},
        {id: 11, name: "Raysan", pincode: "382007"},
        {id: 12, name: "Pethapur", pincode: "382610"},
        {id: 13, name: "Randheja", pincode: "382620"},
        {id: 14, name: "Indroda", pincode: "382007"},
        {id: 15, name: "Bhat", pincode: "382428"},
        {id: 16, name: "Sector 6", pincode: "382006"},
        {id: 17, name: "Sector 7", pincode: "382007"},
        {id: 18, name: "Sector 16", pincode: "382016"},
        {id: 19, name: "Sector 17", pincode: "382016"},
        {id: 20, name: "Sector 19", pincode: "382021"},
    ],
};

// All citys list
app.get('/api/cities',(req,res) => {
    const cities =  Object.keys(cityAreas);
    res.json({success: true, cities});
});


// Specific city area
app.get('/api/cities/:cityName/areas', (req, res) => {
    const cityParam = req.params.cityName;
    const matchedKey = Object.keys(cityAreas).find(
        k => k.toLowerCase() === cityParam.toLowerCase()
    );

    if (!matchedKey) {
        return res.status(404).json({success: false, message: "City not found!"});
    }

    res.json({success: true, city: matchedKey, areas: cityAreas[matchedKey]});
});

//All city all area
app.get('/api/areas',(req,res) => {
    res.json({success: true, data: cityAreas});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});