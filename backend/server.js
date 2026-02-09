require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/user');

const app = express();
const billsRoutes = require('./routes/bills');

const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/niagaBuckWheat';
const MONGO_URI = process.env.MONGO_URI;
// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for Base64 images/PDFs
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.url}`);
    next();
});

// Database Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected to niagaBuckWheat'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/bills', billsRoutes);

app.get('/', (req, res) => {
    res.send('NIAGA Backend Running');
});

// Start Server
// app.listen(PORT, '192.168.29.73', () => {
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
