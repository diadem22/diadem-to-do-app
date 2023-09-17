const { checkBlacklisted, createBlackList } = require('../../src/controllers/blacklist');
const { Blacklist } = require('../../src/models/blacklist');
const mockingoose = require('mockingoose');

describe('createBlackList', () => {
  it('should create and return a blacklist token', async () => {
    const mockToken = 'testtoken';
    const mockBlacklist = {
      token: mockToken,
    };

    mockingoose(Blacklist).toReturn(mockBlacklist, 'save');

    const result = await createBlackList(mockToken);

    expect(result).toBeDefined();
    expect(result.token).toBe(mockToken);
  });

  it('should handle blacklist creation error', async () => {
    mockingoose(Blacklist).toReturn(
      new Error('Error saving blacklist'),
      'save'
    );

    errorData = {
        name: 'nvhgfh'
    }

    const result = await createBlackList(errorData[0]);
    expect(result).toBe('Path `token` is required.');
  }); 
});

describe('checkBlacklisted', () => {
  it('should find and return a blacklisted token', async () => {
    const mockToken = 'testtoken';
    const mockBlacklist = {
      token: mockToken,
    };

    mockingoose(Blacklist).toReturn(mockBlacklist, 'findOne');

    const result = await checkBlacklisted(mockToken);

    expect(result).toBeDefined();
    expect(result.token).toBe(mockToken);
  });

  it('should return null if the token is not blacklisted', async () => {
    mockingoose(Blacklist).toReturn(null, 'findOne');

    const result = await checkBlacklisted('testtoken');

    expect(result).toBeNull();
  });
});
