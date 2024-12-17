// routes/rider.js
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js'; // Import the Rider model
import { generateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rider Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;
  console.log(req.body);

  try {
    // Check if rider with the email already exists
    let user = await User.findOne({ email });
    if (user  ) {
      return res.status(400).json({ msg: 'Email already exists' });
    }

    // Check if rider with the phone number already exists
    user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ msg: 'Phone number already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new rider
    user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    const token = generateToken(user);
    // console.log(token);
    await user.save();

    res.status(201).json({ msg: 'User registered successfully', token });
  } catch (error) {
    console.error('Error:', error.message); // Log detailed error message
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

export default router;
