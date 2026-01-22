const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

module.exports = async (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Verify user exists
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Token is valid, but user not found' });
        }

        // Attach user info to request
        // req.user = user; // better than decoded only
        // Ensure userId is available for backward compatibility with routes
        req.user = {
            ...user.toObject(),
            userId: user._id
        };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
};
