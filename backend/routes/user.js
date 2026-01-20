const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Update User Profile (Personalization)
router.post('/personalize', auth, async (req, res) => {
    try {
        const { spendingPreference, lifestyle, securityQuestion, securityAnswer, devNote } = req.body;
        console.log('Update Personalization Request:', { userId: req.user.userId, body: req.body });

        // Update user fields
        // Using findByIdAndUpdate
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            {
                $set: {
                    spendingPreference,
                    lifestyle,
                    securityQuestion,
                    securityAnswer,
                    devNote
                }
            },
            { new: true } // Return updated document
        ).select('-password'); // Exclude password from result

        if (!user) {
            console.log('User not found during update');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User Updated Successfully:', user);
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create/Update Budget
router.post('/budget', auth, async (req, res) => {
    try {
        const { totalBudget, budgetStartDate, budgetEndDate, dailyBudget } = req.body;

        console.log('Update Budget Request:', { userId: req.user.userId, body: req.body });

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            {
                $set: {
                    totalBudget,
                    budgetStartDate,
                    budgetEndDate,
                    dailyBudget,
                    isBudgetAssigned: true
                }
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Budget Updated Successfully:', user);
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
