const moment = require('moment');
const mockingoose = require('mockingoose');
const {
  createActivity,
  updateActivity,
  fetchById,
  listActivitiesForDay,
} = require('../../src/controllers/activity');

const { Activity } = require('../../src/models/activity');
const { User } = require('../../src/models/user');
const currentTime = moment().tz('Africa/Lagos');
const currentDateInUserTimezone = moment()
  .tz('Africa/Lagos')
  .format('YYYY-MM-DD');

const fifteenMinutesFromNow = moment(currentTime).add(15, 'minutes');


describe('createActivity', () => {
  it('should create an activity', async () => {

    const mockUser = {
      _id: '60f8d0f7d4f7279cbaf6e789',
      username: 'testuser',
      password: 'longpassword',
      email: 'ife@gmail.com',
      timezone: 'Africa/Lagos',
    };

    mockingoose(User).toReturn(mockUser, 'findOne')
    const mockActivityData = {
      user_id: '60f8d0f7d4f7279cbaf6e789',
      name: 'Test Activity',
      category: 'personal',
      isPublished: true,
      priority: 'low',
      status: 'not-done',
      time: fifteenMinutesFromNow.format('HH:mm'),
      timezone: mockUser.timezone,
      date: currentDateInUserTimezone,
    };

    mockingoose(Activity).toReturn(mockActivityData, 'save');

    const result = await createActivity(
      mockActivityData.user_id,
      mockActivityData.name,
      mockActivityData.category,
      mockActivityData.isPublished,
      mockActivityData.priority,
      mockActivityData.time
    );

    expect(result).toBeDefined();
    expect(result.user_id).toBe(mockActivityData.user_id);
    expect(result.name).toBe(mockActivityData.name);
    expect(result.category).toBe(mockActivityData.category);
    expect(result.isPublished).toBe(mockActivityData.isPublished);
    expect(result.priority).toBe(mockActivityData.priority);
  }, 30000);

  it('should handle errors during activity creation', async () => {

    const result = await createActivity(
      'user_id_2',
      'Test Activity 2',
      'caree',
      true,
      'high',
      fifteenMinutesFromNow.format('HH:mm')
    );

    expect(result).toEqual(
      '`caree` is not a valid enum value for path `category`.'
    );
  }, 30000);
}, 30000);

describe('updateActivity', () => {
  it('should update activity status and priority', async () => {

    const updatedActivityData = {
      user_id: 'user_id_1',
      activity_id: '6521b555d4ad8ce03e54418c',
      name: 'Test Activity',
      category: 'personal',
      priority: 'high',
      isPublished: true,
      status: 'not-done',
      time: fifteenMinutesFromNow.format('HH:mm'),
      timezone: 'Africa/Lagos',
      date: moment().startOf('day').format(),
    };

    mockingoose(Activity).toReturn(updatedActivityData, 'findOneAndUpdate');

    const result = await updateActivity(
      updatedActivityData.user_id,
      updatedActivityData.activity_id,
      updatedActivityData.category,
      updatedActivityData.priority,
      updatedActivityData.status
    );
    
    expect(result.status).toBe(updatedActivityData.status);
    expect(result.category).toBe(updatedActivityData.category);
  });
});


describe('fetchById', () => {
  it('should fetch all activities for the user', async () => {
    const mockActivityData = {
      user_id: 'user_id_1',
    };

    const fetchedActivityData = [
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

    mockingoose(Activity).toReturn(fetchedActivityData, 'find');

    const result = await fetchById(mockActivityData.user_id);

    expect(result[0].category).toBe(fetchedActivityData[0].category);
    expect(result[0].priority).toBe(fetchedActivityData[0].priority);
  });
});

