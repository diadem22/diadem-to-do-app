const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['spiritual', 'career', 'exercise', 'personal'],
  },
  date: { type: Date, default: Date.now },
  isPublished: { type: Boolean },
  priority: {
    type: String,
    required: true,
    enum: ['high', 'low'],
  },
  status: {
    type: String,
    enum: ['not-done', 'in-progress', 'completed'],
    default: 'not-done',
  },
  time: {
    type: String, 
  },
});
  
const Activity = mongoose.model('Activity', activitySchema); 
module.exports = { Activity }

