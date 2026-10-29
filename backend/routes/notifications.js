const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Expo } = require('expo-server-sdk');

// Initialize Expo SDK
const expo = new Expo();

/**
 * Register Expo push token for a user.
 * Expected body: { userId: String, expoPushToken: String }
 */
router.post('/register-token', async (req, res) => {
  try {
    const { userId, expoPushToken } = req.body;
    if (!userId || !expoPushToken) {
      return res.status(400).json({ message: 'userId and expoPushToken required' });
    }
    // Validate token format
    if (!Expo.isExpoPushToken(expoPushToken)) {
      return res.status(400).json({ message: 'Invalid Expo push token format' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.expoPushToken = expoPushToken;
    await user.save();
    res.json({ message: 'Push token registered successfully' });
  } catch (err) {
    console.error('Error registering push token:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Send a push notification to a specific user.
 * Expected body: { userId: String, title: String, body: String, data?: Object }
 */
router.post('/send-alert', async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;
    if (!userId || !title || !body) {
      return res.status(400).json({ message: 'userId, title and body required' });
    }
    const user = await User.findById(userId);
    if (!user || !user.expoPushToken) {
      return res.status(404).json({ message: 'User or push token not found' });
    }
    const messages = [];
    if (!expo.isExpoPushToken(user.expoPushToken)) {
      return res.status(400).json({ message: 'Stored push token is invalid' });
    }
    messages.push({
      to: user.expoPushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
    });
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification:', error);
      }
    }
    res.json({ message: 'Notification sent', tickets });
  } catch (err) {
    console.error('Error in send-alert:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
