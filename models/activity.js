const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config()

mongoose
  .connect(process.env.MONGO_DB_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.log('Could not connect to MongoDB...', err));

  const activitySchema = new mongoose.Schema({
    user_id: {
      type: String,
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

