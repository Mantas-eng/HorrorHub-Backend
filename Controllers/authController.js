const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserVerification = require("../models/UserVerification");
const { v4: uuidv4 } = require("uuid");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async ({ _id, email, verificationToken }) => {
  const currentUrl = `${process.env.FRONTEND_URL}/verify`;
  const verificationLink = `${currentUrl}?userId=${_id}&uniqueString=${verificationToken}`;

  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Verify Your Email",
    html: `
      <p>Verify your email address to complete the signup and login into your account.</p>
      <p>This link <b>expires in 6 hours</b>.</p>
      <p>Press <a href="${verificationLink}">here</a> to proceed.</p>
    `,
  };

  const hashedUniqueString = await bcrypt.hash(verificationToken, 10);

  const newVerification = new UserVerification({
    userId: _id,
    uniqueString: hashedUniqueString,
    createdAt: Date.now(),
    expiresAt: Date.now() + 21600000, // 6 hours
  });

  await newVerification.save();

  try {
    await sgMail.send(msg);
    return { success: true, message: "Verification email sent" };
  } catch (error) {
    console.error("Error sending email:", error.response?.body || error);
    return { success: false, message: "Failed to send verification email" };
  }
};

const authController = {
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.verified)
        return res
          .status(401)
          .json({ message: "You need to verify your email first." });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        return res.status(401).json({ message: "Incorrect password" });

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  register: async (req, res) => {
    const { username, email, password } = req.body;

    try {
      // Patikriname email
      let existingEmailUser = await User.findOne({ email });
      if (existingEmailUser) {
        if (existingEmailUser.verified) {
          return res
            .status(400)
            .json({ message: "User with this email already exists" });
        } else {
          // Email yra, bet nepatvirtintas – persiunčiam verification email
          const verificationToken = uuidv4();
          await UserVerification.deleteMany({ userId: existingEmailUser._id });

          const { success, message } = await sendVerificationEmail({
            _id: existingEmailUser._id,
            email: existingEmailUser.email,
            verificationToken,
          });

          if (!success) return res.status(500).json({ message });

          return res.status(409).json({
            message:
              "Email is already registered but not verified. Verification email resent.",
          });
        }
      }

      // Patikriname username
      const existingUsernameUser = await User.findOne({ username });
      if (existingUsernameUser)
        return res.status(400).json({
          message: "Username already taken. Please choose another one.",
        });

      // Sukuriame naują vartotoją
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = uuidv4();

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: "user",
        verified: false,
      });
      await newUser.save();

      const { success, message } = await sendVerificationEmail({
        _id: newUser._id,
        email: newUser.email,
        verificationToken,
      });

      if (!success) return res.status(500).json({ message });

      res.status(201).json({
        message:
          "User registered successfully. Please check your email for verification.",
        user: newUser,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  verifyEmail: async (req, res) => {
    const { userId, uniqueString } = req.params;

    try {
      const userVerification = await UserVerification.findOne({ userId });
      if (!userVerification)
        return res
          .status(400)
          .json({ message: "Invalid or expired verification token" });

      if (userVerification.expiresAt < Date.now()) {
        await UserVerification.deleteOne({ userId });
        return res.status(400).json({
          message: "Verification token has expired. Please request a new one.",
        });
      }

      const isMatch = await bcrypt.compare(
        uniqueString,
        userVerification.uniqueString
      );
      if (!isMatch)
        return res
          .status(400)
          .json({ message: "Invalid or expired verification token" });

      const user = await User.findById(userId);
      if (!user) return res.status(400).json({ message: "User not found" });

      user.verified = true;
      await user.save();
      await UserVerification.deleteOne({ userId });

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.status(200).json({
        message: "Email verified successfully",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = authController;
