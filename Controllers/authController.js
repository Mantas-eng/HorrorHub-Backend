const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserVerification = require('../models/UserVerification');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

let transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  logger: true,
  debug: true,
  secureConnection: false,
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

const sendVerificationEmail = ({ _id, email }, res) => {
  const currentUrl = 'http://localhost:8080/api/verify/';
  const uniqueString = uuidv4() + _id;

  const mailOptions = {
    from: process.env.AUTH_USER,
    to: email,
    subject: 'Verify Your Email',
    html: `<p>Verify your email address to complete the signup and login into your account.</p><p>This link <b>expires in 6 hours</b>.</p><p>Press <a href="${currentUrl + _id + "/" + uniqueString}">here</a> to proceed.</p>`,
  };

  const saltRounds = 10;
  bcrypt.hash(uniqueString, saltRounds).then((hashedUniqueString) => {
    const newVerification = new UserVerification({
      userId: _id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expiresAt: Date.now() + 21600000,
    });

    newVerification.save()
      .then(() => {
        transporter.sendMail(mailOptions)
          .then(() => {
            res.json({
              status: "PENDING",
              message: "Verification email sent",
            });
          })
          .catch((error) => {
            console.log(error);
            res.json({
              status: "FAILED",
              message: "Verification email failed",
            });
          });
      })
      .catch((error) => {
        console.log(error);
        res.json({
          status: "FAILED",
          message: "Couldn't save verification email data!",
        });
      });
  }).catch((error) => {
    console.log(error);
    res.json({
      status: "FAILED",
      message: "An error occurred while hashing email data!",
    });
  });
};

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
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: 'user',
        verified: false
      });
      await newUser.save();

      const token = jwt.sign(
        { userId: newUser._id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      sendVerificationEmail(newUser, res);

      res.status(201).json({
        token,
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
      const userVerification = await UserVerification.find({ userId });
      if (userVerification.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }

      const verificationRecord = userVerification[0];
      if (verificationRecord.expiresAt < Date.now()) {
        await UserVerification.deleteOne({ userId });
        return res.status(400).json({ message: 'Verification token has expired. Please request a new one.' });
      }

      const isMatch = await bcrypt.compare(uniqueString, verificationRecord.uniqueString);
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

      res.status(200).json({ message: 'Account verified successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = authController;
