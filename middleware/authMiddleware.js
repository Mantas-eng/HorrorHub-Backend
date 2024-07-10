    const jwt = require('jsonwebtoken');
    const User = require('../models/User');

    const authMiddleware = async (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 

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
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
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
