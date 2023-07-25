const { verifyToken, verifyAccess, verifyUsername } = require('../../src/middleware/auth');
const { Blacklist } = require('../../src/models/blacklist');
const { User } = require('../../src/models/user');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mockingoose = require('mockingoose');

// Mock dependencies
jest.mock('../../src/models/blacklist');
jest.mock('../../src/models/user');
jest.mock('jsonwebtoken');
jest.mock('dotenv');
dotenv.config.mockReturnValue();

describe('verifyToken', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if authHeader is missing', async () => {
    const req = { headers: {} };
    const res = { sendStatus: jest.fn() };
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
  });

  it('should return 401 if the token is blacklisted', async () => {
    const req = { headers: { cookie: 'token=blacklistedtoken' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    Blacklist.findOne.mockReturnValue({ token: 'blacklistedtoken' });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Session expired. Please re-login',
    });
  });

  it('should return 403 if the token verification fails', async () => {
    const req = { headers: { cookie: 'token=invalidtoken' } };
    const res = { sendStatus: jest.fn() };
    const next = jest.fn();

    Blacklist.findOne.mockReturnValue(null);

    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Token verification failed'));
    });

    await verifyToken(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('should call next if the token is valid and not blacklisted', async () => {
    const req = { headers: { cookie: 'token=validtoken' } };
    const res = {};
    const next = jest.fn();

    Blacklist.findOne.mockReturnValue(null);

    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null);
    });

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});


describe('verifyAccess', () => {
  it('should return 401 if authHeader is missing', async () => {
    const req = { body: {}, headers: {} };
    const res = { sendStatus: jest.fn() };
    const next = jest.fn();

    await verifyAccess(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 if user token does not match cookie', async () => {
    const req = {
      body: { user_id: 'testuserid' },
      headers: { cookie: 'token=invalidtoken' },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    const mockUser = {
      _id: 'testuserid',
      token: 'validtoken',
    };


    mockingoose(User).toReturn(mockUser, 'findOne');

    await verifyAccess(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access not Authorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if user token matches cookie', async () => {
    const req = {
      body: { user_id: 'testuserid' },
      headers: { cookie: 'token=validtoken' },
    };
    const res = {};
    const next = jest.fn();

    const mockUser = {
      _id: 'testuserid',
      token: 'validtoken',
    };

    mockingoose(User).toReturn(mockUser, 'findOne');

    await verifyAccess(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('verifyUsername', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next if the username does not exist', async () => {
    const req = { body: { username: 'testuser' } };
    const res = {};
    const next = jest.fn();

    mockingoose(User).toReturn(null, 'findOne');

    await verifyUsername(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 400 if the username already exists', async () => {
    const req = { body: { username: 'existinguser' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    const mockUser = {
      _id: 'testuserid',
      username: 'existinguser',
    };

    mockingoose(User).toReturn(mockUser, 'findOne');

    await verifyUsername(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Username exists' });
    expect(next).not.toHaveBeenCalled();
  });

  
});

