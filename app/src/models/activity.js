const mongoose = require('mongoose');
const moment = require('moment');

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
  date: {
    type: Date,
    required: true,
    default: moment().startOf('day').format(),
  },
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
    required: true,
    validate: {
      validator: function (value) {
        const currentTime = moment();
        const providedTime = moment(value, 'HH:mm', true); 
        return (
          providedTime.isValid() && providedTime.isSameOrAfter(currentTime)
        );
      }
    },
  },
});
  
const Activity = mongoose.model('Activity', activitySchema); 
module.exports = { Activity }

