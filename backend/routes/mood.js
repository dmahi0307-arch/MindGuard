// backend/routes/mood.js
const express = require('express');
const router = express.Router();
const MoodLog = require('../models/MoodLog');
const BurnoutService = require('../services/burnoutService');

// Middleware to ensure user is authenticated – placeholder (actual auth middleware to be added later)
function requireAuth(req, res, next) {
  // In real code you would verify JWT and set req.userId
  if (!req.headers['x-user-id']) return res.status(401).json({ message: 'Unauthenticated' });
  req.userId = req.headers['x-user-id'];
  next();
}

// Create a new mood entry
router.post('/', requireAuth, async (req, res) => {
  try {
    const { emotion, sourceMode, details } = req.body;
    const entry = new MoodLog({ userId: req.userId, emotion, sourceMode, details });
    await entry.save();
    // Evaluate burnout risk after each entry
    const risk = await BurnoutService.evaluateRisk(req.userId);
    res.json({ entry, burnoutRisk: risk });
  } catch (e) {
    console.error('Mood create error', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all mood logs for the current user (optionally with query params for date range)
router.get('/', requireAuth, async (req, res) => {
  try {
    const logs = await MoodLog.find({ userId: req.userId }).sort({ timestamp: -1 });
    res.json(logs);
  } catch (e) {
    console.error('Mood fetch error', e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
