const mongoose = require('mongoose');
const { User } = require('./user');

mongoose
  .connect(
    `mongodb+srv://Ifeoluwa:Gbenro@clustertest.ps0lptp.mongodb.net/test`,
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.log('Could not connect to MongoDB...', err));

  const activitySchema = new mongoose.Schema({
    user_id: {
      type: String,
      ref: User,
      required: true
    },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['spiritual', 'career', 'exercise', 'personal'],
    },
    date: { type: Date, default: Date.now },
    isPublished: Boolean,
    priority: {
      type: String,
      required: true,
      enum: ['high', 'low'],
    },
  });
  
  const Activity = mongoose.model('Activity', activitySchema); 

module.exports = { Activity }

