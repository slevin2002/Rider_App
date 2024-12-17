// routes/login.js
import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// Rider Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if rider exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Rider not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({ token });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

export default router;
