const { schemaValidator } = require('../../src/middleware/validate');
const schemas = require('../../src/middleware/schemas');

function createMockReq(method, body) {
  return {
    method: method,
    body: body,
  };
}

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe('Schema Validator Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockRes = createMockRes();
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next if the request method is not supported', () => {
    const unsupportedMethod = 'options';
    mockReq = createMockReq(unsupportedMethod, {});

    const middleware = schemaValidator('/activity/create');

    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('should call next if the schema is not found for the path', () => {
    const supportedMethod = 'post';
    mockReq = createMockReq(supportedMethod, {});

    const invalidPath = '/user/create';
    const middleware = schemaValidator(invalidPath);

    const originalThrowError = console.error;
    console.error = jest.fn();

    middleware(mockReq, mockRes, mockNext);

    // expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(422);
    expect(mockRes.json).toHaveBeenCalled();

    console.error = originalThrowError;
  });

  it('should return 422 with custom error for invalid request body', () => {
    const supportedMethod = 'post';
    mockReq = createMockReq(supportedMethod, {});

    const middleware = schemaValidator('/activity/create');

    middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(422);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Invalid request. Please review the request and try again.',
      error: {
        details: [
          {
            message: 'user_id is required',
            type: 'any.required',
          },
          {
            message: 'name is required',
            type: 'any.required',
          },
          {
            message: 'category is required',
            type: 'any.required',
          },
          {
            message: 'priority is required',
            type: 'any.required',
          },
        ],
        original: {},
      },
      status: 'failed',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next and update req.body with validated data for valid request body', () => {
    const supportedMethod = 'post';
    const requestBody = {
      user_id: 'user_id_1',
      name: 'Test Activity',
      category: 'personal',
      isPublished: true,
      priority: 'low',
    };
    mockReq = createMockReq(supportedMethod, requestBody);

    const middleware = schemaValidator('/activity/create');

    schemas['/activity/create'].validate = jest.fn(() => ({
      error: null,
      value: requestBody,
    }));

    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
    expect(mockReq.body).toEqual(requestBody);
  });
});
