const { Blacklist } = require('../../src/models/blacklist');
const mockingoose = require('mockingoose');

describe('Blacklist Model', () => {
  it('should create and return a blacklisted token', async () => {
    const mockToken = 'mocktoken';
    const mockBlacklist = {
      token: mockToken,
    };

    mockingoose(Blacklist).toReturn(mockBlacklist, 'save');

    const blacklist = new Blacklist({ token: mockToken });
    const savedBlacklist = await blacklist.save();

    expect(savedBlacklist).toBeDefined();
    expect(savedBlacklist.token).toBe(mockToken);
  });
});
