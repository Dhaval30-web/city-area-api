const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(5000, ()=> {
    console.log('Server is running on http://localhost:5000');
});
