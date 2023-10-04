const moment = require('moment-timezone');
const jstz = require('jstimezonedetect');
const { Activity } = require('../models/activity');
const axios = require('axios');

async function createActivity(
  user_id,
  name,
  category,
  isPublished,
  priority,
  time
) {
  try {
    const ipApiData = await axios.get('http://ip-api.com/json');
    const userTimezone = ipApiData.data.timezone;
    const currentTimeInUserTimezone = moment().tz(userTimezone);
    const activityTimeInUserTimezone = moment.tz(
      time,
      'HH:mm',
      userTimezone
    );
    
    const activityTimeInUserTimezone1 = moment(time, 'HH:mm').tz(userTimezone);

    console.log(
      `activityTimeInUserTimezone1- ${activityTimeInUserTimezone1}`
    );
    console.log(`currentTimeInUserTimezone- ${currentTimeInUserTimezone}`);
    console.log(`activityTimeInUserTimezone- ${activityTimeInUserTimezone}`);
    if (activityTimeInUserTimezone.isBefore(currentTimeInUserTimezone)) {
      return 'The specified time is in the past.';
    }

    console.log(userTimezone);
    const currentDateInUserTimezone = currentTimeInUserTimezone
      .startOf('day')
      .format();


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
        timezone: userTimezone
      });
      const result = await activity.save();
      return result;
    }
  } catch (ex) {
    console.error('Error while creating activity', ex);
  }
}


async function updateActivity(
  user_id,
  activity_id,
  category,
  priority,
  status
) {
  const result = await Activity.findOneAndUpdate(
    {
      user_id: user_id,
      _id: activity_id,
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

  return result;
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
  listActivitiesForDay,
};
