// Manual mock for expo-server-sdk
// Prevents Jest from parsing the ESM source code
const mockExpo = {
  isExpoPushToken: jest.fn().mockReturnValue(true),
  chunkPushNotifications: jest.fn((msgs) => [msgs]),
  sendPushNotificationsAsync: jest.fn().mockResolvedValue([{ status: 'ok' }]),
};

class Expo {
  constructor() {
    Object.assign(this, mockExpo);
  }
}

// Static method
Expo.isExpoPushToken = jest.fn().mockReturnValue(true);

module.exports = { Expo };
