const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const mongoose = require('mongoose');

// Get all bills for a user
router.get('/:userId', async (req, res) => {
    try {
        const bills = await Bill.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(bills);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Upload a new bill
router.post('/upload', async (req, res) => {
    const { userId, title, description, amount, date, fileType, fileData, fileName, mimeType } = req.body;

    if (!userId || !title) {
        return res.status(400).json({ message: 'UserId and Title are required' });
    }

    try {
        const newBill = new Bill({
            userId,
            title,
            description,
            amount,
            date: date || Date.now(),
            fileType,
            fileData,
            fileName,
            mimeType
        });

        const savedBill = await newBill.save();
        res.status(201).json(savedBill);
    } catch (err) {
        console.error('Error saving bill:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// Delete a bill
router.delete('/:id', async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        await Bill.findByIdAndDelete(req.params.id);
        res.json({ message: 'Bill deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
