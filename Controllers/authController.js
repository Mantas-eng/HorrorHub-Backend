const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authController = {
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.error(`Login failed: User with email ${email} not found`);
        return res.status(404).json({
          message: 'User with such email not found'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.error(`Login failed: Incorrect password for user ${email}`);
        return res.status(401).json({
          message: 'Incorrect password'
        });
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log(`Login successful for user ${email}`);
      res.status(200).json({
        message: 'Login successful',
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error(`Login error: ${error.message}`);
      res.status(500).json({
        message: error.message
      });
    }
  },

  register: async (req, res) => {
    const { username, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.error(`Registration failed: User with email ${email} already exists`);
        return res.status(400).json({
          message: 'User with this email already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: 'user' 
      });
      await newUser.save();

      const token = jwt.sign(
        { userId: newUser._id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log(`Registration successful for user ${email}`);
      res.status(201).json({
        token,
        user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role }
      });
    } catch (error) {
      console.error(`Registration error: ${error.message}`);
      res.status(500).json({
        message: error.message
      });
    }
  }
};

module.exports = authController;
