const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        console.error('Authentication required: No token found');
        return res.status(401).json({
            message: 'Authentication required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.userId) {
            console.error('Authentication failed: Invalid token');
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            console.error('Authentication failed: User not found');
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        req.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'JWT token has expired'
            });
        }
        res.status(401).json({
            message: 'Authentication required'
        });
    }
};
