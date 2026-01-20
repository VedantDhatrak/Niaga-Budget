const mongoose = require('mongoose');

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
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
