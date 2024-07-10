const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verificationController = {
    verifyEmail: async (req, res) => {
        try {
            const { token } = req.params;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findOne({ email: decoded.email, verificationToken: token });
            if (!user) {
                return res.status(400).json({
                    message: 'Invalid verification token'
                });
            }

            user.verified = true;
            user.verificationToken = undefined; 
            await user.save();

            res.status(200).json({
                message: 'Email successfully verified'
            });
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
};

module.exports = verificationController;
