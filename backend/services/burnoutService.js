// backend/services/burnoutService.js
const MoodLog = require('../models/MoodLog');

// Simple mapping of emotion strings to a stress score (0 = calm, 1 = high stress)
const emotionScores = {
  happy: 0.2,
  relaxed: 0.1,
  neutral: 0.5,
  sad: 0.6,
  anxious: 0.8,
  stressed: 0.9,
};

/**
 * Evaluate burnout risk for a user.
 * Returns an object { riskLevel: 'low'|'medium'|'high', score: number }
 */
async function evaluateRisk(userId) {
  // Look at the last 7 mood entries (roughly a week if daily)
  const recent = await MoodLog.find({ userId })
    .sort({ timestamp: -1 })
    .limit(7);
  if (recent.length === 0) return { riskLevel: 'low', score: 0 };

  // Convert each emotion to a numeric stress score
  const scores = recent.map(entry => emotionScores[entry.emotion] ?? 0.5);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  let riskLevel = 'low';
  if (avg >= 0.75) riskLevel = 'high';
  else if (avg >= 0.5) riskLevel = 'medium';

  return { riskLevel, score: parseFloat(avg.toFixed(2)) };
}

module.exports = { evaluateRisk };
