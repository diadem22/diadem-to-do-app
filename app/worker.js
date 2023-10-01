const schedule = require('node-schedule');
const moment = require('moment');
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
  const currentTime = moment();
  const fifteenMinutesFromNow = moment().add(15, 'minutes');

  const activitiesToRemind = await Activity.find({
    status: 'not-done',
    time: {
      $gte: currentTime.format('HH:mm'),
      $lte: fifteenMinutesFromNow.format('HH:mm'),
    },
  }).maxTimeMS(30000);

  for (const activity of activitiesToRemind) {
    try {
      const user = await User.findOne({ _id: activity.user_id });

      if (user && user.email) {
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
        } else {
          console.log(
            `Activity with ID ${activity._id} has already been sent as a reminder.`
          );
        }
      } else {
        console.error(
          `No user or email found for activity with ID: ${activity._id}`
        );
      }
    } catch (error) {
      console.error('Error fetching user or adding reminder job:', error);
    }
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
