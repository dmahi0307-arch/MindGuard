const mongoose = require('mongoose');

const MoodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  emotion: { type: String, required: true }, // e.g., happy, sad, stressed
  sourceMode: { type: String, enum: ['text', 'voice', 'video'], required: true },
  details: { type: mongoose.Schema.Types.Mixed }, // extra data like confidence scores
});

module.exports = mongoose.model('MoodLog', MoodLogSchema);
