const { User } = require('../../src/models/user');
const mockingoose = require('mockingoose');


describe('User Model', () => {
  it('should create and return a user', async () => {
    const mockUser = {
      username: 'testuser',
      password: 'longpassword',
    };

    mockingoose(User).toReturn(mockUser, 'save');

    const user = new User(mockUser);
    const savedUser = await user.save();

    
    expect(savedUser).toBeDefined();
    expect(savedUser.username).toBe(mockUser.username);
    expect(savedUser.password).toBe(mockUser.password);
    
  });
});
