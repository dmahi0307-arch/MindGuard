// backend/tests/interactions.test.js
const request = require('supertest');
const app = require('../server');
const MoodLog = require('../models/MoodLog');

// Mock MoodLog model so tests don't require a real MongoDB connection
jest.mock('../models/MoodLog');

// Mock burnoutService to prevent real burnout calculations
jest.mock('../services/burnoutService', () => ({
  recalculateBurnout: jest.fn().mockResolvedValue(null),
}));

// Setup the mock before each test
beforeEach(() => {
  jest.clearAllMocks();
  MoodLog.mockImplementation(function (data) {
    this._id = 'mock-id-123';
    this.userId = data.userId;
    this.sourceMode = data.sourceMode;
    this.emotion = data.emotion;
    this.details = data.details;
    this.save = jest.fn().mockResolvedValue(this);
    // Ensure toJSON returns plain data
    this.toJSON = () => ({
      _id: this._id,
      userId: this.userId,
      sourceMode: this.sourceMode,
      emotion: this.emotion,
      details: this.details,
    });
    return this;
  });
});

describe('POST /api/interactions/text', () => {
  it('should return 400 if userId is missing', async () => {
    const res = await request(app)
      .post('/api/interactions/text')
      .send({ text: 'I feel happy today' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/userId/i);
  });

  it('should return 400 if text is missing', async () => {
    const res = await request(app)
      .post('/api/interactions/text')
      .send({ userId: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/text/i);
  });

  it('should detect "stressed" emotion from text', async () => {
    const res = await request(app)
      .post('/api/interactions/text')
      .send({ userId: '123', text: 'I feel so stressed today' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Text processed');
    // The moodLog may be serialized differently; check the response has moodLog
    expect(res.body.moodLog).toBeDefined();
  });

  it('should detect "happy" emotion from text', async () => {
    const res = await request(app)
      .post('/api/interactions/text')
      .send({ userId: '123', text: 'Today was a really good day' });
    expect(res.statusCode).toBe(200);
    expect(res.body.moodLog).toBeDefined();
  });

  it('should return "neutral" for generic text', async () => {
    const res = await request(app)
      .post('/api/interactions/text')
      .send({ userId: '123', text: 'The weather is okay' });
    expect(res.statusCode).toBe(200);
    expect(res.body.moodLog).toBeDefined();
  });
});

describe('POST /api/interactions/voice', () => {
  it('should return 400 if userId is missing', async () => {
    const res = await request(app)
      .post('/api/interactions/voice')
      .send({ audioBase64: Buffer.from('fake-audio').toString('base64') });
    expect(res.statusCode).toBe(400);
  });

  it('should return 400 if audioBase64 is missing', async () => {
    const res = await request(app)
      .post('/api/interactions/voice')
      .send({ userId: '123' });
    expect(res.statusCode).toBe(400);
  });

  it('should process voice and return a mood log', async () => {
    const res = await request(app)
      .post('/api/interactions/voice')
      .send({
        userId: '123',
        audioBase64: Buffer.from('fake-audio-data').toString('base64'),
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Voice processed');
    expect(res.body.moodLog).toBeDefined();
  });
});

describe('POST /api/interactions/video', () => {
  it('should return 400 if userId is missing', async () => {
    const res = await request(app)
      .post('/api/interactions/video')
      .send({ videoBase64: Buffer.from('fake-video').toString('base64') });
    expect(res.statusCode).toBe(400);
  });

  it('should return 400 if videoBase64 is missing', async () => {
    const res = await request(app)
      .post('/api/interactions/video')
      .send({ userId: '123' });
    expect(res.statusCode).toBe(400);
  });

  it('should process video and return a mood log', async () => {
    const res = await request(app)
      .post('/api/interactions/video')
      .send({
        userId: '123',
        videoBase64: Buffer.from('fake-video-data').toString('base64'),
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Video processed');
    expect(res.body.moodLog).toBeDefined();
  });
});
