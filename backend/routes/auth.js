// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Load env vars
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretdev';
const EMAIL_TOKEN_EXP = '24h'; // verification token expires in 24h

// Register endpoint – creates user and sends verification email
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'User already exists' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({ email, passwordHash, name, isVerified: false });
    await user.save();
    // create verification token (short‑lived JWT)
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: EMAIL_TOKEN_EXP });
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    await emailService.sendVerification(email, verificationLink);
    res.status(201).json({ message: 'User created. Check email for verification link.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Email verification endpoint – called from link in email
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send('Invalid token');
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).send('User not found');
    if (user.isVerified) return res.send('Email already verified');
    user.isVerified = true;
    await user.save();
    // You could redirect to a nice front‑end page
    res.send('Email successfully verified. You may now log in.');
  } catch (err) {
    console.error('Verification error:', err);
    res.status(400).send('Invalid or expired token');
  }
});

// Login endpoint – returns JWT only if email is verified
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const authToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '2h' });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ authToken, refreshToken, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
