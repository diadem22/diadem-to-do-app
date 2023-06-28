const mongoose = require('mongoose');

mongoose
  .connect(`${process.env.MONGO_URI}`, {
    useNewUrlParser: true,
  })
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.log('Could not connect to MongoDB...', err));

  const activitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['spiritual', 'career', 'exercise', 'personal'],
    },
    author: String,
    date: { type: Date, default: Date.now },
    isPublished: Boolean,
    priority: {
      type: Number,
      type: String,
      required: true,
      enum: ['high', 'low'],
      },
  });

    const Activity = mongoose.model('Activity', activitySchema);

 async function createActivity(
    name,
    category,
    author,
    date,
    isPublished,
    priority
  ) {
    let activity = new Activity({
      name: name,
      isPublished: isPublished,
      priority: priority,
      category: category,
      author: author,
      date: date
    });

    try {
      const result = await activity.save();
      return result
    } catch (ex) {
      for (field in ex.errors) console.log(ex.errors[field].message);
    }
  };

async function updateActivity(id, name, category, priority) {
  const result = await Activity.findByIdAndUpdate(
    id,
    {
      $set: {
        name: name,
        isPublished: true,
        category: category,
        priority: priority
      },
    },
    { new: true }
  );

  return result;
}

async function fetchByDateAndAuthor(author) {
  const result = await Activity.find(
    {
      author: author
    }
  )
  
  return result;
}

module.exports = {
  createActivity,
  updateActivity,
  fetchByDateAndAuthor,
};