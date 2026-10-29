// backend/tests/notifications.test.js
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

// Mock User model
jest.mock('../models/User');

// expo-server-sdk is automatically mocked by __mocks__/expo-server-sdk.js

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/notifications/register-token', () => {
  it('should return 400 if userId is missing', async () => {
    const res = await request(app)
      .post('/api/notifications/register-token')
      .send({ expoPushToken: 'ExponentPushToken[xxx]' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/userId/i);
  });

  it('should return 400 if expoPushToken is missing', async () => {
    const res = await request(app)
      .post('/api/notifications/register-token')
      .send({ userId: 'user123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/expoPushToken/i);
  });

  it('should return 404 if user is not found', async () => {
    User.findById = jest.fn().mockResolvedValue(null);
    const res = await request(app)
      .post('/api/notifications/register-token')
      .send({ userId: 'user123', expoPushToken: 'ExponentPushToken[xxx]' });
    expect(res.statusCode).toBe(404);
  });

  it('should save the push token and return success', async () => {
    const mockUser = {
      _id: 'user123',
      expoPushToken: null,
      save: jest.fn().mockResolvedValue(true),
    };
    User.findById = jest.fn().mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/notifications/register-token')
      .send({ userId: 'user123', expoPushToken: 'ExponentPushToken[xxx]' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/registered/i);
    expect(mockUser.expoPushToken).toBe('ExponentPushToken[xxx]');
    expect(mockUser.save).toHaveBeenCalled();
  });
});

describe('POST /api/notifications/send-alert', () => {
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/notifications/send-alert')
      .send({ userId: 'user123' });
    expect(res.statusCode).toBe(400);
  });

  it('should return 404 if user has no push token', async () => {
    User.findById = jest.fn().mockResolvedValue({ _id: 'user123', expoPushToken: null });
    const res = await request(app)
      .post('/api/notifications/send-alert')
      .send({ userId: 'user123', title: 'Alert', body: 'Take a break' });
    expect(res.statusCode).toBe(404);
  });

  it('should send notification and return tickets', async () => {
    User.findById = jest.fn().mockResolvedValue({
      _id: 'user123',
      expoPushToken: 'ExponentPushToken[xxx]',
    });
    const res = await request(app)
      .post('/api/notifications/send-alert')
      .send({ userId: 'user123', title: 'Burnout Alert', body: 'Please take a break!' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/sent/i);
    expect(res.body.tickets).toBeDefined();
  });
});
