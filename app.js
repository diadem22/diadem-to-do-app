const express = require('express');
const app = express();
const {
  createActivity,
  updateActivity,
  fetchByDateAndAuthor,
} = require('./models/index');

app.use(express.urlencoded({ extended: false }));

app.use(express.json());



  app.post('/to-do/create', async (req, res) => {
    const { name, category, author, date, isPublished, priority } = req.body;

    const activity = await createActivity(
      name,
      category,
      author,
      date,
      isPublished,
      priority
    );
    return res.status(200).json({ data: activity, success: true, message: "Activity created" });
  }
  );

  app.put('/to-do/update', async (req, res) => {
    const { id, name, priority, category } = req.body;

    const activity = await updateActivity(
      id,
      name,
      category,
      priority
    );
    return res.status(200).json({ data: activity, success: true, message: 'Activity updated' });
  });

  app.get('/to-do/fetch', async (req, res) => {
    const { author } = req.body;

    const activity = await fetchByDateAndAuthor(author);
    
    return res
      .status(200)
      .json({
        data: activity,
        success: true,
        message: 'Activity retrieved',
      });
  });


app.listen(process.env.PORT || 6000, () => {
  console.log('Server is listening on port 6000....');
});




