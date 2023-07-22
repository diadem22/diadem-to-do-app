const express = require('express');
const jwt = require('jsonwebtoken');

const {
  createActivity,
  updateActivity,
  fetchById,
} = require('../controllers/activity');

const {
  verifyToken,
  verifyAccess,
  checkActivityName,
} = require('../middleware/auth');
const { schemaValidator } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/create',
  schemaValidator('/activity/create'),
  verifyToken,
  verifyAccess,
  checkActivityName,
  async (req, res, next) => {
    try {
    const { user_id, name, category,  isPublished, priority } = req.body;
      const activity = await createActivity(
        user_id,
        name,
        category,
        isPublished,
        priority
      );

      return res.status(200).json({
        data: activity,
        success: true,
        message: 'Activity created',
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.put(
  '/update',
  schemaValidator('/activity/update'),
  verifyToken,
  verifyAccess,
  async (req, res, next) => {
    const { user_id, name, priority, category } = req.body;

    try {
      const activity = await updateActivity(user_id, name, category, priority);
      return res
        .status(200)
        .json({ data: activity, success: true, message: 'Activity updated' });
    } catch (error) {
      return next(error);
    }
  }
);

router.get('/fetch', verifyToken, verifyAccess, async (req, res, next) => {
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

module.exports = router;
