const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get Current User Profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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


// Add Daily Spending Entry
router.post('/daily-spending', auth, async (req, res) => {
    try {
        const { amount, label } = req.body;

        if (!amount || !label) {
            return res.status(400).json({ message: 'Amount and label are required' });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const spendingEntry = {
            amount: Number(amount),
            label,
            date: new Date()
        };

        // Push to array
        user.dailySpending.push(spendingEntry);

        await user.save();

        // Return updated user (without password)
        const updatedUser = await User.findById(user._id).select('-password');

        res.json(updatedUser);

    } catch (err) {
        console.error('Daily Spending Error:', err.message);
        res.status(500).send('Server Error');
    }
});



// Archive Current Budget
router.post('/archive-budget', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Calculate total spent
        const totalSpent = user.dailySpending.reduce((sum, item) => sum + item.amount, 0);

        // Create history entry
        const historyEntry = {
            startDate: user.budgetStartDate,
            endDate: user.budgetEndDate,
            totalBudget: user.totalBudget,
            dailyBudget: user.dailyBudget,
            totalSpent: totalSpent,
            spendingEntries: [...user.dailySpending],
            archivedAt: new Date()
        };

        // Update user: push history, reset current fields
        user.budgetHistory.push(historyEntry);

        // Reset current budget fields
        user.dailySpending = [];
        user.totalBudget = 0;
        user.dailyBudget = 0;
        user.budgetStartDate = null;
        user.budgetEndDate = null;
        user.isBudgetAssigned = false;

        await user.save();

        const updatedUser = await User.findById(user._id).select('-password');
        res.json(updatedUser);

    } catch (err) {
        console.error('Archive Budget Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
