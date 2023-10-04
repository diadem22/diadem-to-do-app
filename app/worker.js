const schedule = require('node-schedule');
const moment = require('moment-timezone');
const Queue = require('bull');
const nodemailer = require('nodemailer');
const { User } = require('./src/models/user');
const { Activity } = require('./src/models/activity');
const { ObjectId } = require('mongoose').Types;
const { connectToDatabase } = require('./index');

connectToDatabase();

const reminderQueue = new Queue('reminderQueue', {
  redis: {
    host: 'localhost',
    port: 6379,
  },
});

const job = schedule.scheduleJob('* * * * *', async () => {
  try {

    const notDoneActivities = await Activity.find({
      status: 'not-done',
    });

    for (const activity of notDoneActivities) {
      const user = await User.findOne({ _id: activity.user_id });

      if (!user || !user.email) {
        console.error(
          `No user or email found for activity with ID: ${activity._id}`
        );
        continue;
      }

     const userTimezone = activity.timezone;
      const currentTime = moment().tz(userTimezone);
      
      const fifteenMinutesFromNow = moment(currentTime).add(15, 'minutes');
      const activityTime = moment.tz(activity.time, 'HH:mm', userTimezone);

      if (
        activityTime.isSameOrAfter(currentTime) &&
        activityTime.isBefore(fifteenMinutesFromNow)
      ) {
        const isActivitySent = await reminderQueue.getJobs(
          ['completed', 'waiting', 'active'],
          0,
          -1,
          'asc'
        );
        const activityObjectId = new ObjectId(activity._id);
        const isActivityAlreadySent = isActivitySent.some((job) => {
          return job.data.activity_id == activityObjectId;
        });

        if (!isActivityAlreadySent) {
          await reminderQueue.add({
            email: user.email,
            subject: 'Reminder: Your Task',
            text: `Don't forget to complete your task: ${activity.name}`,
            activity_id: activity._id,
          });

          console.log(`Reminder added for activity with ID ${activity._id}`);
        } else {
          console.log(
            `Activity with ID ${activity._id} has already been sent as a reminder.`
          );
        }
      }
    }
  } catch (error) {
    console.error('Error processing reminders:', error);
  }
});


const eveningReminderJob = schedule.scheduleJob('0 22 * * *', async () => {
  try {

    const activitiesToRemind = await Activity.find({
      $or: [{ status: 'in-progress' }, { status: 'not-done' }],
    });

    const activitiesByUser = {};

    for (const activity of activitiesToRemind) {
      const user = await User.findOne({ _id: activity.user_id });

      if (!user || !user.email) {
        console.error(`No user or email found for activity with ID: ${activity._id}`);
        continue;
      }

      const userTimezone = activity.timezone;
      const currentTimeInUserTimezone = moment().tz(userTimezone);

      if (moment.tz(activity.time, 'HH:mm', userTimezone).isSameOrAfter(currentTimeInUserTimezone)) {
        if (!activitiesByUser[user._id]) {
          activitiesByUser[user._id] = [];
        }
        activitiesByUser[user._id].push(activity.name);
      }
    }

    for (const user_id in activitiesByUser) {
      const user = await User.findOne({ _id: user_id });

      if (user && user.email) {
        const emailBody = `Reminder: You have the following tasks to complete: ${activitiesByUser[
          user_id
        ].join(', ')}`;

        await reminderQueue.add({
          email: user.email,
          subject: 'Evening Reminder: Your Tasks',
          text: emailBody,
        });
      } else {
        console.error(`No user or email found for user with ID: ${user_id}`);
      }
    }

    console.log('Evening reminder emails sent.');
  } catch (error) {
    console.error('Error sending evening reminder emails:', error);
  }
});


async function sendReminder(jobData) {
  const { email, subject, text, activity_id } = jobData;

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    text: text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Reminder email sent:', info.response);
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
}

reminderQueue.process(async (job) => {
  try {
    await sendReminder(job.data);
    console.log('Reminder email sent successfully.');
  } catch (error) {
    console.error('Error processing job:', error);
  }
});
