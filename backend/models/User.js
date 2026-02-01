const mongoose = require('mongoose');

const dailySpendingSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    label: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Storing plaintext as requested
    // Personalization Fields
    spendingPreference: { type: String },
    lifestyle: { type: String },
    securityQuestion: { type: String },
    securityAnswer: { type: String },
    devNote: { type: String },
    isBudgetAssigned: {
        type: Boolean,
        default: false
    },
    // Budget Fields
    totalBudget: { type: Number },
    budgetStartDate: { type: Date },
    budgetEndDate: { type: Date },
    dailyBudget: { type: Number },

    dailySpending: [dailySpendingSchema],

    // Budget History
    budgetHistory: [{
        startDate: Date,
        endDate: Date,
        totalBudget: Number,
        dailyBudget: Number,
        totalSpent: Number,
        spendingEntries: [dailySpendingSchema],
        archivedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
