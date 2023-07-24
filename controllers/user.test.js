const { createUser, loginUser } = require('./user');
const { User } = require('../models/user');
const mockingoose = require('mockingoose');
const { describe } = require('node:test');

describe('createUser', () => {
  it('should create a user', async () => {
    const mockUser = {
      _id: '60f8d0f7d4f7279cbaf6e789',
      username: 'testuser',
      password: 'longpassword',
    };

    mockingoose(User).toReturn(mockUser, 'save');

    const result = await createUser('testuser', 'longpassword');

    expect(result).toBeDefined();
    expect(result._id.toString()).toBe(mockUser._id);
    expect(result.username).toBe(mockUser.username);
    expect(result.password).toBe(mockUser.password);
  });

  it('should handle user creation error', async () => {
    mockingoose(User).toReturn(new Error('Error saving user'), 'save');

    const result = await createUser('testuser', 'longp');

    expect(result).toBe(
      'Path `password` (`longp`) is shorter than the minimum allowed length (6).'
    );
  });
});

describe('loginUser', () => {
    it('should find and return a user', async () => {
      const mockUser = {
        _id: '60f8d0f7d4f7279cbaf6e789',
        username: 'testuser',
        password: 'longpassword',
      };

      mockingoose(User).toReturn(mockUser, 'findOne');

      const result = await loginUser('testuser', 'longpassword');

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(mockUser._id);
      expect(result.username).toBe(mockUser.username);
      expect(result.password).toBe(mockUser.password);
    });

    it('should return null if the user is not found', async () => {
      mockingoose(User).toReturn(null, 'findOne');

      const result = await loginUser('testuser', 'longpassword');

      expect(result).toBeNull();
    });
});
