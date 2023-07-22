const { Activity } = require('../models/activity')

async function createActivity(
  user_id,
  name,
  category,
  isPublished,
  priority
) {
  let activity = new Activity({
    user_id: user_id,
    name: name,
    isPublished: isPublished,
    priority: priority,
    category: category
  });

  try {
    const result = await activity.save();
    return result;
  } catch (ex) {
    for (field in ex.errors) console.log(ex.errors[field].message);
  }
}

async function updateActivity(user_id,  name, category, priority) {
  const result = await Activity.findOneAndUpdate(
    {
      name: name,
      user_id: user_id,
      
    },
    {
      $set: {
        isPublished: true,
        category: category,
        priority: priority,
      },  
    },
    {
      sort: { "points" : 1 }, upsert:true, returnNewDocument : true 
    }
  );

  return result;
}

async function fetchById(id) {
  const result = await Activity.find({
    user_id: id
  });

  return result;
}

module.exports = {
  createActivity,
  updateActivity,
  fetchById,
};
