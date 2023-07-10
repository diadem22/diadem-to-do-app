const express = require('express');
const app = express();
const {
  createActivity,
  updateActivity,
  fetchById,
} = require('./controllers/activity');
const { createUser } = require('./controllers/user')

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

  app.get('/', (req, res) => {
    res.send('to-do-app.com');
  });

  app.post('/to-do/create-user', async (req, res, next) => {
    const { name } = req.body;

    try {
      const user = await createUser(
        name
      );
      return res
        .status(200)
        .json({ data: user, success: true, message: 'User created' });
    } catch (error) {
      return next(error);
    }
  });

  app.post('/to-do/create-activity', async (req, res, next) => {
    const { user_id, name, category, date, isPublished, priority } = req.body;

    try {
      const activity = await createActivity(
        user_id,
        name,
        category,
        date,
        isPublished,
        priority
      );
      return res
        .status(200)
        .json({ data: activity, success: true, message: 'Activity created' });
    } catch (error) {
      return next(error);
    }
  });

  
    app.put('/to-do/update-activity', async (req, res, next) => {
    const { id, name, priority, category } = req.body;

    try {
      const activity = await updateActivity(id, name, category, priority);
      return res
        .status(200)
        .json({ data: activity, success: true, message: 'Activity updated' });
    } catch (error) {
      return next(error);
    }
  }); 

  app.get('/to-do/fetch', async (req, res, next) => {
    const { user_id } = req.body;

    try {
      const activity = await fetchById(user_id);
      return res.status(200).json({
        data: activity,
        success: true,
        message: 'Activity retrieved',
      });
    } catch (error) {
      return next(error);
    }
  });


app.listen(process.env.PORT || 6000, () => {
  console.log('Server is listening on port 6000....');
});




