const moment = require('moment-timezone');
const { Activity } = require('../models/activity');
const axios = require('axios');
const { User } = require('../models/user');
const { ObjectId } = require('mongoose').Types;

async function createActivity(
  user_id,
  name,
  category,
  isPublished,
  priority,
  time
) {
  try {
    const user = await User.findOne({
      _id: user_id
    })
    const userTimezone = user.timezone
    
    const currentDateInUserTimezone = moment()
      .tz(userTimezone)
      .format('YYYY-MM-DD');
    

    const activityTimeInUserTimezone = moment(
      time + ' ' + currentDateInUserTimezone,
      'HH:mm YYYY-MM-DD'
    ).tz(userTimezone);
    
    const activityTimeInUserTimezone1 = moment.tz(
      time + ' ' + currentDateInUserTimezone,
      'HH:mm YYYY-MM-DD',
      userTimezone
    );
    const currentTimeInUserTimezone = moment().tz(userTimezone);
    if (activityTimeInUserTimezone1.isBefore(currentTimeInUserTimezone)) {
      return 'The specified time is in the past.';
    }

    const existingActivity = await Activity.findOne({
      user_id: user_id,
      name: name,
      time: time,
      date: currentDateInUserTimezone,
    });

    if (existingActivity) {
      console.log('A task with the same name already exists on this day.');
    } else {
      const activity = new Activity({
        user_id: user_id,
        name: name,
        isPublished: isPublished,
        priority: priority,
        category: category,
        time: time,
        date: currentDateInUserTimezone,
        timezone: userTimezone,
      });
      const result = await activity.save();
      return result;
    }
  } catch (ex) {
    for (field in ex.errors) return ex.errors[field].message;
  }
}


async function updateActivity(
  user_id,
  activity_id,
  category,
  priority,
  status
) {
  try {
    const result = await Activity.findOneAndUpdate(
      {
        user_id: user_id,
        _id: new ObjectId(activity_id),
      },
      {
        $set: {
          isPublished: true,
          category: category,
          priority: priority,
          status: status,
        },
      },
      {
        new: true,
      }
    );
    const updatedActivity = await result.save();

    return updatedActivity;
  } catch (ex) {
    for (field in ex.errors) return ex.errors[field].message;
  }
}

async function fetchById(id) {
  const result = await Activity.find({
    user_id: id,
  });

  return result;
}

async function listActivitiesForDay(user_id) {
  try {
    const now = moment();
    const startOfDay = now.clone().startOf('day');
    const endOfDay = now.clone().endOf('day');

    const activities = await Activity.find({
      user_id: user_id,
      date: {
        $gte: startOfDay.toDate(),
        $lte: endOfDay.toDate(),
      },
    }).select('name status date time');

    return activities;
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
}

module.exports = {
  createActivity,
  updateActivity,
  fetchById,
  listActivitiesForDay
};
