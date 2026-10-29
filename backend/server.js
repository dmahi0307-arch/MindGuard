const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

// Simple rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Import routers
const authRouter = require('./routes/auth');
const moodRouter = require('./routes/mood');
const notificationsRouter = require('./routes/notifications');
const interactionsRouter = require('./routes/interactions');

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/mood', moodRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/interactions', interactionsRouter);

// Placeholder health check
app.get('/health', (req, res) => res.json({status: 'ok'}));

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
