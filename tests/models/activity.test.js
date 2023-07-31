const mockingoose = require('mockingoose');
const { Activity } = require('../../src/models/activity');


describe('Activity Model', () => {
  it('should create and return an activity', async () => {
      const mockActivityData = {
        user_id: 'user_id_1',
        name: 'Test Activity',
        category: 'personal',
        isPublished: true,
        priority: 'low',
      };

    mockingoose(Activity).toReturn(mockActivityData, 'save')

    const activity = new Activity(mockActivityData);
    const savedActivity = await activity.save()

    expect(savedActivity).toBeDefined()
    expect(savedActivity.user_id).toBe(mockActivityData.user_id)
    expect(savedActivity.name).toBe(mockActivityData.name);
    expect(savedActivity.category).toBe(mockActivityData.category);
    expect(savedActivity.isPublished).toBe(mockActivityData.isPublished);
    expect(savedActivity.priority).toBe(mockActivityData.priority);

  })

})
