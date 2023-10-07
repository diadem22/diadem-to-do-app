const express = require('express');
const request = require('supertest');
const mockingoose = require('mockingoose');
const jwt = require('jsonwebtoken');
const { createUser, loginUser, updateUser} = require('../../src/controllers/user');
const { User } = require('../../src/models/user');
const {
  checkBlacklisted,
  createBlackList,
} = require('../../src/controllers/blacklist');

const { schemaValidator } = require('../../src/middleware/validate');
const router = require('../../src/routes/user');
const dotenv = require('dotenv');
const { describe } = require('node:test');

dotenv.config();

const app = express();
app.use(express.json());
app.use(router);

const mockUser = {
  _id: 1,
  username: 'test_user',
  password: 'test_password',
  email: 'ife@gmail.com',
};
const mockToken = jwt.sign({ id: mockUser._id }, process.env.SECRET_TOKEN, {
  expiresIn: '20m',
});

jest.mock('../../src/controllers/user', () => ({
  createUser: jest.fn(),
  loginUser: jest.fn(),
  updateUser: jest.fn()
}));

jest.mock('../../src/controllers/blacklist', () => ({
  checkBlacklisted: jest.fn(),
  createBlackList: jest.fn(),
}));

jest.mock('../../src/middleware/auth', () => ({
  verifyToken: jest.fn((req, res, next) => next()),
  verifyAccess: jest.fn((req, res, next) => next()),
  verifyUsername: jest.fn((req, res, next) => next()),
}));


describe('create user', () => {
  it('POST /create should create a user', async () => {
    const mockUserInput = {
      username: 'test_user',
      password: 'test_password',
      email: 'ife@gmail.com',
      timezone: 'Africa/Lagos',
    };

    mockingoose(User).toReturn(mockUserInput, 'save');

    await createUser.mockResolvedValue(mockUser.username, mockUser.password, mockUser.email);

    const response = await request(app).post('/create').send(mockUserInput);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User successfully created');
    expect(createUser).toHaveBeenCalledWith(
      mockUserInput.username,
      mockUserInput.password,
      mockUserInput.email,
      mockUserInput.timezone
    );
  });

  it('should handle error when createUser fails', async () => {
    createUser.mockRejectedValue(new Error('User creation failed'));

    const mockUserInput = {
      username: 'test_user',
      password: 'test_password',
      email: 'ife@gmail.com',
      timezone: 'Africa/Lagos',
    };

    const response = await request(app).post('/create').send(mockUserInput);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('User not successful created');
    expect(response.body.error).toBe('User creation failed');
  });
});

describe('login', () => {
  it('POST /login should log in a user and return a JWT token in a cookie', async () => {
    const mockUserInput = { username: 'test_user', password: 'test_password' };

    const mockedUser = {
      username: 'test_user',
      password: 'test_password',
      token: mockToken,
    };
    mockingoose(User).toReturn(mockUserInput, 'save');

    await loginUser.mockResolvedValue(mockUser);
    jwt.sign = jest.fn(() => mockToken);

    const response = await request(app).post('/login').send(mockUserInput);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('You have successfully logged in.');
    expect(response.body.user_id).toBe(mockUser._id);

    expect(response.header['set-cookie'][0]).toMatch(`token=${mockToken}`);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: mockUser._id },
      process.env.SECRET_TOKEN,
      {
        expiresIn: '20m',
      }
    );
  });
  it('POST /login should return error message for invalid username or password', async () => {
    loginUser.mockResolvedValue(null);

    const mockUserInput = {
      username: 'invalid_user',
      password: 'invalid_password',
    };

    const response = await request(app).post('/login').send(mockUserInput);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid username or password');
  });
});

describe('logout', () => {
  it('GET /logout should log out a user and blacklist the token', async () => {
    const mockAccessToken = 'mock_access_token';
    const mockCookie = `token=${mockAccessToken}`;
    const mockAuthHeader = { cookie: mockCookie };

    checkBlacklisted.mockResolvedValue(false);
    createBlackList.mockResolvedValue(true);

    const response = await request(app)
      .get('/logout')
      .set('cookie', mockCookie);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('You are logged out!');
    expect(response.header['clear-site-data']).toBe('"cookies", "storage"');

    expect(checkBlacklisted).toHaveBeenCalledWith(mockAccessToken);
    expect(createBlackList).toHaveBeenCalledWith(mockAccessToken);
  });

  it('should return 204 status code when authHeader is not present', async () => {
    const response = await request(app).get('/logout');

    expect(response.statusCode).toBe(204);
  });

  it('should handle internal server error and return 500 status code', async () => {
    const mockAccessToken = 'mock_access_token';
    const mockCookie = `token}`;
    const mockAuthHeader = { cookie: mockCookie };

    const response = await request(app)
      .get('/logout')
      .set('cookie', mockCookie);

    expect(response.statusCode).toBe(500);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Internal Server Error');
  });

  it('should return 204 status code when ifBlacklisted is truthy', async () => {
    // Mock the checkBlacklisted function to return a truthy value (e.g., true)
    checkBlacklisted.mockResolvedValue(true);

    const response = await request(app)
      .get('/logout')
      .set('cookie', 'token=some_access_token');

    expect(response.statusCode).toBe(204);
  });

  it('should not return 204 status code when ifBlacklisted is falsy', async () => {
    // Mock the checkBlacklisted function to return a falsy value (e.g., false)
    checkBlacklisted.mockResolvedValue(false);

    const response = await request(app)
      .get('/logout')
      .set('cookie', 'token=some_access_token');

    expect(response.statusCode).not.toBe(204);
  });
});

describe('User Update Route', () => {
  it('should update user information', async () => {
    const mockUser = {
      _id: 'user_id_1',
      email: 'test@example.com',
      timezone: 'Africa/Lagos',
    };
    await updateUser.mockResolvedValue(mockUser);

    const user_id = 'user_id_1';
    const updatedUserData = {
      email: 'newemail@example.com',
      timezone: 'America/New_York',
    };


    const response = await request(app)
      .put('/update/:user_id')
      .send(updatedUserData);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(mockUser);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('User updated');
  });
});
