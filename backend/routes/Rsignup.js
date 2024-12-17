// routes/rider.js
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/Rider.js'; // Import the User model
import { generateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rider Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    // Input Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }

    // Check if password meets complexity requirements
    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: 'Password must be at least 6 characters long' });
    }

    // Check if user with the email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Email already exists' });
    }

    // Check if user with the phone number already exists
    user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ msg: 'Phone number already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    // Response with token and user data
    res.status(201).json({
      msg: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

export default router;
