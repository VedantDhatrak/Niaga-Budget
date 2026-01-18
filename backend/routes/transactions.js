const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// Get all transactions for user
router.get('/', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.userId }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add new transaction
router.post('/', auth, async (req, res) => {
    try {
        const { title, amount, type } = req.body;

        // Simple validation
        if (!title || !amount || !type) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const newTransaction = new Transaction({
            userId: req.user.userId,
            title,
            amount,
            type,
        });

        const transaction = await newTransaction.save();
        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
