const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, mobile, email, password } = req.body;

        // Validation
        if (!name || !mobile || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user (Plain text password as requested)
        const newUser = new User({
            name,
            mobile,
            email,
            password,
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password (Plain text comparison)
        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });

        const isPersonalized = !!user.spendingPreference;
        const isBudgetAssigned = user.isBudgetAssigned;

        res.json({ token, user: { id: user._id, name: user.name, email: user.email }, isPersonalized, isBudgetAssigned });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
