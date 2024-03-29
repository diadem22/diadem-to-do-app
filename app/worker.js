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
      const user = await User.findOne({ _id: new ObjectId(activity.user_id) });

      const userTimezone = activity.timezone;
      const currentTime = moment().tz(userTimezone);
      const currentDateInUserTimezone = moment()
        .tz(userTimezone)
        .format('YYYY-MM-DD');

      const fifteenMinutesFromNow = moment(currentTime).add(15, 'minutes');
      const activityTime = moment.tz(
        activity.time + ' ' + currentDateInUserTimezone,
        'HH:mm YYYY-MM-DD',
        userTimezone
      );

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
            html: `
              <html>
                <body>
                  <p>Don't forget to complete your task:</p>
                  <p>${activity.name} set for ${activity.time}</p>
                </body>
              </html>
            `,
            activity_id: activity._id,
            text: `Don't forget to complete your task: ${activity.name} set for ${activity.time}`,
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



const eveningReminderJob = schedule.scheduleJob('* * * * *', async () => {
  try {
    const users = await User.find();

    for (const user of users) {
      const userTimezone = user.timezone;
      const currentTimeInUserTimezone = moment().tz(userTimezone);


      if (
        currentTimeInUserTimezone.isSame(
          moment().tz(userTimezone).hour(22).minute(0).second(0),
          'minute'
        )
      ) {
        const currentDateInUserTimezone =
          currentTimeInUserTimezone.format('YYYY-MM-DD');
        const activitiesToRemind = await Activity.find({
          $or: [{ status: 'in-progress' }, { status: 'not-done' }],
          user_id: user._id,
          date: currentDateInUserTimezone,
        });

        const activitiesByUser = {};

        for (const activity of activitiesToRemind) {
          if (!activitiesByUser[user._id]) {
            activitiesByUser[user._id] = [];
          }
          activitiesByUser[user._id].push(
            `${activity.name}: status- ${activity.status}\n`
          );
        }

        if (Object.keys(activitiesByUser).length > 0) { 

          await reminderQueue.add({
            email: user.email,
            subject: 'Evening Reminder: Your Tasks',
            html: `
            <html>
              <body>
                <h2>Reminder: You have the following tasks to complete today:</h2>
                <ul>
                  ${activitiesByUser[user._id]
                    .map((activity) => `<li>${activity}</li>`)
                    .join('')}
                </ul>
              </body>
            </html>
          `,
          text: `Reminder: You have the following tasks to complete today: \n \n ${activitiesByUser[
            user._id
          ].join('\n ')}` 
          });

          console.log(
            `Evening reminder email sent to user with ID: ${user._id}`
          );
        }
      }
    }
  } catch (error) {
    console.error('Error sending evening reminder emails:', error);
  }
});



async function sendReminder(jobData) {
  const { email, subject, html, text, activity_id } = jobData;

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
    html: html,
    text: text
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
