const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    amount: {
        type: Number,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    fileType: {
        type: String, // 'image' or 'pdf'
        required: false
    },
    fileData: {
        type: String, // Base64 encoded string
        required: false
    },
    fileName: {
        type: String,
        required: false
    },
    mimeType: {
        type: String,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Bill', BillSchema);
