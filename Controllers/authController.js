const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserVerification = require('../models/UserVerification');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.AUTH_USER,
    pass: process.env.AUTH_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for messages");
    console.log(success);
  }
});

const sendVerificationEmail = async ({ _id, email, verificationToken }) => {
  const currentUrl = 'https://horrorhub-backend-3.onrender.com/verify'; 
  const mailOptions = {
    from: process.env.AUTH_USER,
    to: email,
    subject: 'Verify Your Email',
    html: `
      <p>Verify your email address to complete the signup and login into your account.</p>
      <p>This link <b>expires in 6 hours</b>.</p>
      <p>Press <a href="${currentUrl}/${_id}/${verificationToken}">here</a> to proceed.</p>
    `,
  };

  const saltRounds = 10;
  const hashedUniqueString = await bcrypt.hash(verificationToken, saltRounds);

  const newVerification = new UserVerification({
    userId: _id,
    uniqueString: hashedUniqueString,
    createdAt: Date.now(),
    expiresAt: Date.now() + 21600000, // 6 hours expiration time
  });

  await newVerification.save();

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send verification email' };
  }
};

const authController = {
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User with this email not found' });
      }

      if (!user.verified) {
        return res.status(401).json({ message: 'You need to verify your email first.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Incorrect password' });
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
      res.status(500).json({ message: error.message });
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
      const verificationToken = uuidv4(); // Generate unique verification token
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: 'user',
        verified: false,
        verificationToken // Save the token in the database
      });

      await newUser.save();

      // Send verification email
      const {success,message} = await sendVerificationEmail(newUser);
      /*const { success, message } = await sendVerificationEmail({
        _id: newUser._id,
        email: newUser.email,
        verificationToken
      });
      */

      if (!success) {
        return res.status(500).json({ message });
      }

      res.status(201).json({
        message: 'User registered successfully. Please check your email for verification.',
        user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role }
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  },

  verifyEmail: async (req, res) => {
    const { userId, uniqueString } = req.params;

    try {
      const userVerification = await UserVerification.findOne({ userId });
      if (!userVerification) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }

      if (userVerification.expiresAt < Date.now()) {
        await UserVerification.deleteOne({ userId });
        return res.status(400).json({ message: 'Verification token has expired. Please request a new one.' });
      }

      const isMatch = await bcrypt.compare(uniqueString, userVerification.uniqueString);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

      user.verified = true;
      await user.save();
      await UserVerification.deleteOne({ userId });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Serve the verified page
      res.sendFile(path.join(__dirname, "./../public/verified.html"));

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = authController;
