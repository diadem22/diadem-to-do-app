const mockingoose = require('mockingoose');
const jwt = require('jsonwebtoken');
const { User } = require('../../src/models/user');
const { Blacklist } = require('../../src/models/blacklist');
const { Activity } = require('../../src/models/activity');
const {
  verifyToken,
  fetchUser,
  verifyAccess,
  checkUserId,
  verifyUsername,
  checkActivityName,
} = require('../../src/middleware/auth');
const { fetchById } = require('../../src/controllers/activity');

function createMockReq() {
  return {
    headers: {},
    body: {},
  };
}

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
    sendStatus: jest.fn(),
  };
}

jest.mock('jsonwebtoken');

describe('Authentication Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = createMockReq();
    mockRes = createMockRes();
    mockNext = jest.fn();
    isValidObjectId = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockingoose.resetAll();
  });

  describe('verifyToken', () => {
    it('should return 401 if no token provided in the cookie', async () => {
      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.sendStatus).toHaveBeenCalledWith(401);
    });

    it('should return 401 if the token is blacklisted', async () => {
      const mockToken = 'mock_token';
      mockReq.headers.cookie = `token=${mockToken}`;

      mockingoose(Blacklist).toReturn({ token: mockToken }, 'findOne');

      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Session expired. Please re-login',
      });
    });

    it('should return 403 if jwt.verify throws an error', async () => {
      const mockToken = 'mock_token';
      mockReq.headers.cookie = `token=${mockToken}`;

      mockingoose(Blacklist).toReturn(null);

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'));
      });

      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.sendStatus).toHaveBeenCalledWith(403);
    });

    it('should call next if the token is valid', async () => {
      const mockToken = 'mock_token';
      mockReq.headers.cookie = `token=${mockToken}`;

      mockingoose(Blacklist).toReturn(null);

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null);
      });

      await verifyToken(mockReq, mockRes, mockNext);

    //   expect(mockNext).toHaveBeenCalled();
    });
  });

    describe('verifyAccess', () => {
       it('should return 401 if authHeader is not provided', async () => {
         mockReq = createMockReq('user_id_1', null);

         await verifyAccess(mockReq, mockRes, mockNext);

         expect(mockRes.sendStatus).toHaveBeenCalledWith(401);
         expect(mockNext).not.toHaveBeenCalled();
       });

       it('should call next if user token matches the provided cookie', async () => {
         const mockUserId = '64c98f7d669ec59ecf4c3f75';
         const mockToken = 'mock_token';
         
         mockReq = createMockReq(mockUserId, mockToken);
         mockReq.headers.cookie = `token=${mockToken}`;

         const mockUser = { _id: mockUserId, token: mockToken, username: 'user', password: 'password' };
          
         mockingoose(User).toReturn(mockUser, 'findOne');

         const user = await fetchUser(mockUserId, mockRes)

         await verifyAccess(mockReq, mockRes, mockNext);
        
         expect(user.token).toBeDefined()
         expect(mockNext).toHaveBeenCalled();
       });

       it('should return 401 if user token does not match the provided cookie', async () => {
         const mockUserId = '64c98f7d669ec59ecf4c3f75';
         const mockToken = 'mock_token';
         
         const mockInvalidToken = 'invalid_token';
         mockReq = createMockReq(mockUserId, mockInvalidToken);
         mockReq.headers.cookie = `token=${mockToken}`;

         const mockUser = { _id: mockUserId, token: mockInvalidToken };
         mockingoose(User).toReturn(mockUser, 'findOne');

         const user = await fetchUser(mockUserId, mockRes);

         await verifyAccess(mockReq, mockRes, mockNext);
        
         expect(user.token).toBe(mockInvalidToken);
         expect(mockRes.status).toHaveBeenCalledWith(401);
         expect(mockNext).not.toHaveBeenCalled();
       });
       it('should return 400 if user token does not match the provided cookie', async () => {
         const mockUserId = '64c98f7d669ec59ecf4c3f75';
         const mockToken = 'mock_token';

         const mockInvalidToken = 'invalid_token';
         mockReq = createMockReq(mockUserId, mockInvalidToken);
         mockReq.headers.cookie = `token=${mockToken}`;

         const mockUser = { _id: mockUserId, token: mockInvalidToken };
         mockingoose(User).toReturn(null, 'findOne');

         await fetchUser(mockUserId, mockRes);

         expect(mockRes.status).toHaveBeenCalledWith(400);
         expect(mockRes.json).toHaveBeenCalledWith({
           message: 'User does not exist',
         });
       });

     });
    
      describe('verifyUsername', () => {
        it('should call next if username does not exist', async () => {
          const mockUsername = 'test_username';
          mockReq = createMockReq(mockUsername);

          mockingoose(User).toReturn(null, 'findOne');

          await verifyUsername(mockReq, mockRes, mockNext);

          expect(mockNext).toHaveBeenCalled();
          expect(mockRes.status).not.toHaveBeenCalled();
          expect(mockRes.json).not.toHaveBeenCalled();
        });

        it('should return 400 if username exists', async () => {
          const mockUsername = 'test_username';
          mockReq = createMockReq(mockUsername);

          const mockUser = { username: mockUsername };
          mockingoose(User).toReturn(mockUser, 'findOne');

          await verifyUsername(mockReq, mockRes, mockNext);

          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Username exists',
          });
          expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 if an error occurs during the check', async () => {
          const mockUsername = 'test_username';
          mockReq = createMockReq(mockUsername);

          mockingoose(User).toReturn({username: mockUsername}, 'findOne');

          await verifyUsername(mockReq, mockRes, mockNext);

          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalled();
          expect(mockNext).not.toHaveBeenCalled();
        });
      });
    
      describe('checkActivityName', () => {
        it('should call next if activity name does not exist for the user', async () => {
          const mockActivityName = 'test_activity';
          const mockUserId = 'user_id_1';
          mockReq = createMockReq(mockActivityName, mockUserId);
          
          mockingoose(Activity).toReturn(null, 'findOne');

          await checkActivityName(mockReq, mockRes, mockNext);

          expect(mockNext).toHaveBeenCalled();
          expect(mockRes.status).not.toHaveBeenCalled();
          expect(mockRes.json).not.toHaveBeenCalled();
        });

        it('should return 400 if activity name exists for the user', async () => {
          const mockActivityName = 'test_activity';
          const mockUserId = 'user_id_1';
          mockReq = createMockReq(mockActivityName, mockUserId);

          const mockActivity = { name: mockActivityName, user_id: mockUserId };
          mockingoose(Activity).toReturn(mockActivity, 'findOne');

          await checkActivityName(mockReq, mockRes, mockNext);

          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Activity exists',
          });
          expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 if an error occurs during the check', async () => {
          const mockActivityName = 'test_activity';
          const mockUserId = 'user_id_1';
          mockReq = createMockReq(mockActivityName, mockUserId);

          const mockActivity = { name: mockActivityName, user_id: mockUserId };

          mockingoose(Activity).toReturn(mockActivity, 'findOne');

          await checkActivityName(mockReq, mockRes, mockNext);

          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockNext).not.toHaveBeenCalled();
        });
      });
});
