
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const authController = {
  login: async (req, res) => {
    const {
      username,
      password
    } = req.body;

    try {
      const user = await User.findOne({
        username
      });
      if (!user) {
        return res.status(404).json({
          message: 'User with such username not found'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: 'Incorrect password'
        });
      }

      const token = jwt.sign({
        userId: user._id
      }, 'secretKey', {
        expiresIn: '1h'
      });

      res.status(200).json({
        message: 'Login successful',
        token
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  },
  register: async (req, res) => {
    const {
      username,
      password
    } = req.body;

    try {
      const existingUser = await User.findOne({
        username
      });
      if (existingUser) {
        return res.status(400).json({
          message: 'User with this username already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        password: hashedPassword
      });
      await newUser.save();

      const token = jwt.sign({
        userId: newUser._id
      }, 'secretKey', {
        expiresIn: '1h'
      });

      res.status(201).json({
        token
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  },


}

module.exports = authController;