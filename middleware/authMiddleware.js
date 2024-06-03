const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: 'Authentication required'
        });
    }

    try {
        const decoded = jwt.verify(token, 'secretKey');

        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                message: 'Invalid JWT token'
            });
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: 'Invalid user'
            });
        }

        req.user = {
            username: user._id,
            password: user.username,
        };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'JWT token has expired'
            });
        }
        res.status(401).json({
            message: 'Invalid JWT token'
        });
    }
};

module.exports = authMiddleware;