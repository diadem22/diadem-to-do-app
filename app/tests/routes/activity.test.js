
const http = require('http');
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const {
  createActivity,
  updateActivity,
  fetchById,
} = require('../../src/controllers/activity');

const {
  verifyToken,
  verifyAccess,
  checkActivityName,
} = require('../../src/middleware/auth');
const { schemaValidator } = require('../../src/middleware/validate');

jest.mock('../../src/controllers/activity', () => ({
  createActivity: jest.fn(),
  updateActivity: jest.fn(),
  fetchById: jest.fn(),
}));

jest.mock('../../src/middleware/auth', () => ({
  verifyToken: jest.fn((req, res, next) => next()),
  verifyAccess: jest.fn((req, res, next) => next()),
  checkActivityName: jest.fn((req, res, next) => next()),
}));

jest.mock('../../src/middleware/validate', () => ({
  schemaValidator: jest.fn().mockReturnValue((req, res, next) => next()),
}));

const router = require('../../src/routes/activity');
app.use('/activity', router);

function createMockServer(handler) {
  return http.createServer((req, res) => {
    handler(req, res);
  });
}

describe('Activity Routes', () => {
  let server;

  beforeAll((done) => {
    server = createMockServer(app);
    server.listen(0, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('POST /activity/create should create an activity', async () => {
    const mockActivityData = {
            user_id: 'user_id_1',
              name: 'Test Activity',
              category: 'personal',
              isPublished: true,
              priority: 'low',
              time: '12:00'
    };
    createActivity.mockResolvedValue(mockActivityData);

    const mockActivityRequest = {
      user_id: 'user_id_1',
      name: 'Test Activity',
      category: 'personal',
      isPublished: true,
      priority: 'low',
      time: '12:00',
    };

    const response = await request(server)
      .post('/activity/create/:user_id')
      .send(mockActivityRequest);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Activity created');
    expect(response.body.data).toEqual(mockActivityData);
  });

    it('PUT /update should update an activity', async () => {
    const mockActivityData = {
      user_id: 'user_id_1',
      name: 'Test Activity',
      category: 'personal',
      priority: 'low',
    };
    updateActivity.mockResolvedValue(mockActivityData);

    const mockActivityRequest = {
      user_id: 'user_id_1',
      name: 'Updated Activity',
      category: 'personal',
      priority: 'high',
    };

    const response = await request(server)
      .put('/activity/update/:user_id')
      .send(mockActivityRequest);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Activity updated');
    expect(response.body.data).toEqual(mockActivityData);
    });

    it('GET /fetch/:user_id should fetch an activity', async () => {
      const mockActivityData = [
        {
          user_id: 'user_id_1',
          name: 'Test Activity 1',
          category: 'career',
          priority: 'high',
          isPublished: true,
        },
        {
          user_id: 'user_id_1',
          name: 'Test Activity 3',
          category: 'career',
          priority: 'high',
          isPublished: true,
        },
        {
          user_id: 'user_id_1',
          name: 'Test Activity 2',
          category: 'career',
          priority: 'high',
          isPublished: true,
        },
      ];
    fetchById.mockResolvedValue(mockActivityData);

    const mockActivityRequest = {
        user_id: 'user_id',
      };

    const response = await request(server)
        .get('/activity/fetch/:user_id')
        .send(mockActivityRequest);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Activity retrieved');
    expect(response.body.data).toEqual(mockActivityData);
    });
});
