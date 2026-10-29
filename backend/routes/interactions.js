// backend/routes/interactions.js
const express = require('express');
const router = express.Router();
// removed multer and uuid imports to avoid extra dependencies
const MoodLog = require('../models/MoodLog');
const burnoutService = require('../services/burnoutService'); // optional service for recalculating burnout

// In-memory storage removed; we'll accept base64 strings in request bodies

/**
 * Mock emotion analysis functions.
 * In a real implementation you would call external AI services.
 */
async function analyzeText(text) {
  // Placeholder: simple keyword based mock
  const lower = text.toLowerCase();
  if (lower.includes('stress') || lower.includes('tired')) return { emotion: 'stressed', confidence: 0.9 };
  if (lower.includes('happy') || lower.includes('good')) return { emotion: 'happy', confidence: 0.9 };
  return { emotion: 'neutral', confidence: 0.7 };
}
async function analyzeAudio(buffer) {
  // Placeholder: random emotion
  const emotions = ['happy', 'sad', 'stressed', 'neutral'];
  const emotion = emotions[Math.floor(Math.random() * emotions.length)];
  return { emotion, confidence: 0.8 };
}
async function analyzeVideo(buffer) {
  // Placeholder: random emotion similar to audio
  const emotions = ['happy', 'sad', 'stressed', 'neutral'];
  const emotion = emotions[Math.floor(Math.random() * emotions.length)];
  return { emotion, confidence: 0.85 };
}

/**
 * Helper to create a MoodLog entry.
 */
async function createMoodLog(userId, sourceMode, analysis) {
  const log = new MoodLog({
    userId,
    sourceMode,
    emotion: analysis.emotion,
    details: { confidence: analysis.confidence },
  });
  await log.save();
  // Optionally update burnout score for the user
  if (burnoutService && typeof burnoutService.recalculateBurnout === 'function') {
    await burnoutService.recalculateBurnout(userId);
  }
  return log;
}

// ------------------- Text Interaction -------------------
router.post('/text', async (req, res) => {
  try {
    const { userId, text } = req.body;
    if (!userId || !text) return res.status(400).json({ message: 'userId and text required' });
    const analysis = await analyzeText(text);
    const log = await createMoodLog(userId, 'text', analysis);
    res.json({ message: 'Text processed', moodLog: log });
  } catch (err) {
    console.error('Error processing text interaction:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------- Voice Interaction -------------------
router.post('/voice', async (req, res) => {
  try {
    const { userId, audioBase64 } = req.body;
    if (!userId || !audioBase64) return res.status(400).json({ message: 'userId and audioBase64 required' });
    const buffer = Buffer.from(audioBase64, 'base64');
    const analysis = await analyzeAudio(buffer);
    const log = await createMoodLog(userId, 'voice', analysis);
    res.json({ message: 'Voice processed', moodLog: log });
  } catch (err) {
    console.error('Error processing voice interaction:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------- Video Interaction -------------------
router.post('/video', async (req, res) => {
  try {
    const { userId, videoBase64 } = req.body;
    if (!userId || !videoBase64) return res.status(400).json({ message: 'userId and videoBase64 required' });
    const buffer = Buffer.from(videoBase64, 'base64');
    const analysis = await analyzeVideo(buffer);
    const log = await createMoodLog(userId, 'video', analysis);
    res.json({ message: 'Video processed', moodLog: log });
  } catch (err) {
    console.error('Error processing video interaction:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
