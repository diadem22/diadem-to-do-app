const mockingoose = require('mockingoose');
const { createActivity, updateActivity, fetchById } = require('../../src/controllers/activity'); 

const { Activity } = require('../../src/models/activity');

describe('createActivity', () => {
  it('should create an activity', async () => {
    const mockActivityData = {
      user_id: 'user_id_1',
      name: 'Test Activity',
      category: 'personal',
      isPublished: true,
      priority: 'low',
    };

    mockingoose(Activity).toReturn(mockActivityData, 'save');


    const result = await createActivity(
      mockActivityData.user_id,
      mockActivityData.name,
      mockActivityData.category,
      mockActivityData.isPublished,
      mockActivityData.priority
    );


    expect(result).toBeDefined();
    expect(result.user_id).toBe(mockActivityData.user_id);
    expect(result.name).toBe(mockActivityData.name);
    expect(result.category).toBe(mockActivityData.category);
    expect(result.isPublished).toBe(mockActivityData.isPublished);
    expect(result.priority).toBe(mockActivityData.priority);
  }, 30000);

  it('should handle errors during activity creation', async () => {
    mockingoose(Activity).toReturn(new Error('Mocked error'), 'save');

      const result = await createActivity(
        'user_id_2',
        'Test Activity 2',
        'caree',
        true,
        2
      );


      expect(result).toEqual(
        '`caree` is not a valid enum value for path `category`.'
      );
  }, 30000);
}, 30000);

describe('updateActivity',  () => {
  it('should update and return activity', async () => {
    const mockActivityData = {
      user_id: 'user_id_1',
      name: 'Test Activity',
      category: 'personal',
      priority: 'low',
      isPublished: false
    };

    const updaedActivityData = {
      user_id: 'user_id_1',
      name: 'Test Activity',
      category: 'career',
      priority: 'high',
      isPublished: true
    };

      mockingoose(Activity).toReturn(updaedActivityData, 'findOneAndUpdate');

    const result = await updateActivity(
      mockActivityData.user_id,
      mockActivityData.name,
      mockActivityData.category,
      mockActivityData.priority,
    );


    expect(result.category).toBe(updaedActivityData.category);
    expect(result.priority).toBe(updaedActivityData.priority);
    
  })
})

describe('fetchById', () => {
  it('should fetch all activities for the user', async () => {
    const mockActivityData = {
      user_id: 'user_id_1'
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

    const result = await fetchById(
      mockActivityData.user_id
    );

    expect(result[0].category).toBe(fetchedActivityData[0].category);
    expect(result[0].priority).toBe(fetchedActivityData[0].priority);
  })
})


// const { createActivity, updateActivity, fetchById } = require('./activity');

// const { setUp, dropCollections, dropDatabase } = require('../models/db');

// // Import the real Activity model
// const { Activity } = require('../models/activity');

// const expectedResult = {
//       _id: 'testId',
//       user_id: 'testUser',
//       name: 'Test 461',
//       isPublished: true,
//       priority: 'low',
//       category: 'personal',
//     };

// // Mock the Activity model methods
// jest.mock('../models/activity', () => ({
//   save: () => expectedResult
// }));

// beforeAll(async () => {
//   await setUp();
// });

// describe('createActivity', () => {
//   beforeEach(() => {
//     // Clear all mock calls before each test
//     jest.clearAllMocks();
//   });

//   it('should create and return an activity', async (done) => {
//     const expectedResult = {
//       _id: 'testId',
//       user_id: 'testUser',
//       name: 'Test 461',
//       isPublished: true,
//       priority: 'low',
//       category: 'personal',
//     };

// jest.spyOn(Activity.prototype, 'save').mockReturnValueOnce(expectedResult);
//     const result = await createActivity(
//       'testUser',
//       'Tes462',
//       'career',
//       true,
//       'low'
//     );

//     expect(Activity.save).toHaveBeenCalledWith({
//       result
//     });
//     expect(result).toEqual(expectedResult);
//     done()
//   });
// });

// describe('updateActivity', () => {
//      beforeEach(() => {

//     jest.clearAllMocks();
//   });
//    it('should update and return an activity', async () => {
//     const expectedResult = {
//       _id: 'testId',
//       user_id: 'testUser',
//       name: 'Updated Activity',
//     };
//    Activity.findOneAndUpdate.mockResolvedValue(expectedResult);

//     const result = await updateActivity(
//       'testUser',
//       'Test Activity',
//       'Test Category',
//       'low'
//     );

//     expect(Activity.findOneAndUpdate).toHaveBeenCalledWith(
//       { name: 'Test Activity', user_id: 'testUser' },
//       {
//         $set: {
//           user_id: 'testUser',
//           isPublished: true,
//           category: 'Test Category',
//           priority: 'low',
//         },
//       },
//       {
//         returnNewDocument: true,
//       }
//     );
//     expect(result).toEqual(expectedResult);
//   });
// });

// describe('fetchById', () => {
//   beforeEach(() => {

//     jest.clearAllMocks();
//   });
//     it('should fetch activities by user_id', async () => {
//       const expectedResult = [
//         { _id: 'activity1', name: 'Activity 1' },
//         { _id: 'activity2', name: 'Activity 2' },
//       ];
//       Activity.find.mockResolvedValue(expectedResult);

//       const result = await fetchById('testUser');

//       expect(Activity.find).toHaveBeenCalledWith({ user_id: 'testUser' });
//       expect(result).toEqual(expectedResult);
//     });
// });

// const { createActivity, updateActivity, fetchById } = require('./activity');
// const { setUp, dropCollections, dropDatabase } = require('../models/db');

// // Import the real Activity model
// const { Activity } = require('../models/activity');

// // Mock the Activity model methods
// jest.mock('../models/activity');

// beforeAll(async () => {
//   await setUp();
// });

// describe('createActivity', () => {
//   beforeEach(() => {
//     // Clear all mock calls before each test
//     jest.clearAllMocks();
//   });

//   it('should create and return an activity', async () => {
//     const expectedResult = {
//       _id: 'testId',
//       user_id: 'testUser',
//       name: 'Test 461',
//       isPublished: true,
//       priority: 'low',
//       category: 'personal',
//     };

//     const activityInstanceMock = {
//       save: jest.save().mockResolvedValue(expectedResult), // Mock the save method
//     };

//     // Mock the Activity model's create method to return the activityInstanceMock
//     Activity.create.mockReturnValue(activityInstanceMock);

//     const result = await createActivity(
//       'testUser',
//       'Test 462',
//       'career',
//       true,
//       'low'
//     );

//     expect(Activity.create).toHaveBeenCalledWith({
//       user_id: 'testUser',
//       name: 'Test 462',
//       isPublished: true,
//       priority: 'low',
//       category: 'career',
//     });
//     expect(result).toEqual(expectedResult);
//   }, 15000);
// });
