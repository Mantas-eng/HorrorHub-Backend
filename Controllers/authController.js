const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS  
  }
});

const authController = {
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          message: 'User with such email not found'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: 'Incorrect password'
        });
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role }
      });
    } catch (error) {
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
        return res.status(400).json({
          message: 'User with this email already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: 'user',
        verificationToken
      });
      await newUser.save();

      const emailSent = await sendVerificationEmail(email, verificationToken);

      if (!emailSent) {
        throw new Error('Failed to send verification email');
      }

      res.status(201).json({
        message: 'Registration successful. Verification email sent.',
        user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role }
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  },

  verifyEmail: async (req, res) => {
    const { token } = req.query;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ email: decoded.email });

      if (!user) {
        return res.status(400).json({
          message: 'Invalid token or user not found'
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          message: 'Email is already verified'
        });
      }

      user.isVerified = true;
      await user.save();

      res.status(200).json({
        message: 'Email successfully verified'
      });
    } catch (error) {
      res.status(500).json({
        message: 'Email verification failed'
      });
    }
  }
};

const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,  
      to: email,             
      subject: 'Patvirtinkite savo el. paštą',
      html: `
        <p>Prašome paspausti šią nuorodą norėdami patvirtinti savo el. paštą:</p>
        <p><a href="http://horrorhub-backend.onrender.com/verify-email?token=${verificationToken}">Patvirtinti el. paštą</a></p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('El. laiškas išsiųstas: ', info.response);
    return true;
  } catch (error) {
    console.error('Nepavyko išsiųsti el. laiško: ', error);
    return false;
  }
};

module.exports = authController;
