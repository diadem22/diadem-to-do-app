const { Activity } = require('../models/activity')

async function createActivity(
  user_id,
  name,
  category,
  isPublished,
  priority
) {
  const activity = new Activity({
    user_id: user_id,
    name: name,
    isPublished: isPublished,
    priority: priority,
    category: category
  });
  // console.log('here first')
  try {
    const result = await activity.save();
    console.log(result)
    return result;
  } catch (ex) {
    for (field in ex.errors) return(ex.errors[field].message);
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
        user_id: user_id,
        isPublished: true,
        category: category,
        priority: priority,
      },  
    },
    {
      returnNewDocument : true 
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
