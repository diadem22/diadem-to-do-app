const express = require('express');
const jwt = require('jsonwebtoken');

const {
  createActivity,
  updateActivity,
  fetchById,
  listActivitiesForDay,
} = require('../controllers/activity');

const {
  verifyToken,
  verifyAccess,
  checkActivityName,
} = require('../middleware/auth');
const { schemaValidator } = require('../middleware/validate');
const { error } = require('console');

const router = express.Router();

router.post(
  '/create/:user_id',
  schemaValidator('/activity/create'),
  verifyAccess,
  verifyToken,
  async (req, res, next) => {
    const { user_id } = req.params;
    const { name, category, isPublished, priority, time } = req.body;
    const activity = await createActivity(
      user_id,
      name,
      category,
      isPublished,
      priority,
      time
    );
    
    if(!activity) {
      res.status(400).json({
        message: 'Error creating activity, please check name and time'
      });
    }

    return res.status(200).json({
      data: activity,
      success: true,
      message: 'Activity created',
    });
  }
);


router.put(
  '/update/:user_id',
  schemaValidator('/activity/update'),
  verifyToken,
  verifyAccess,
  async (req, res, next) => {
    const { user_id } = req.params;
    const { activity_id, priority, category, status } = req.body;

      const activity = await updateActivity(
        user_id,
        activity_id,
        priority,
        category,
        status
      );
      return res
        .status(200)
        .json({ data: activity, success: true, message: 'Activity updated' });
  }
);

router.get(
  '/fetch/:user_id',
  verifyToken,
  verifyAccess,
  async (req, res, next) => {
    const { user_id } = req.params;

    const activity = await fetchById(user_id);
    return res.status(200).json({
      data: activity,
      success: true,
      message: 'Activity retrieved',
    });
  }
);

router.get('/fetch-daily-tasks/:user_id', verifyToken, verifyAccess, async (req, res, next) => {
  const { user_id } = req.params;

  const activity = await listActivitiesForDay(user_id);
  return res.status(200).json({
    data: activity,
    success: true,
    message: 'Activities retrieved',
  });
});

module.exports = router;

// 64b94ca91fe6019722dd5582
