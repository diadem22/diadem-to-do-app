const Joi = require('joi');

const activitySchema = Joi.object().keys({
  user_id: Joi.string().required(),
  name: Joi.string().required(),
  category: Joi.string()
    .required()
    .valid('spiritual', 'career', 'exercise', 'personal'),
  date: Joi.date(),
  isPublished: Joi.boolean(),
  priority: Joi.string().required().valid('high', 'low'),
});

const updateSchema = Joi.object().keys({
  user_id: Joi.string().required(),
  id: Joi.string().required(),
});

const userSchema = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().min(6).required().strict()
});

module.exports = {
  '/activity/create': activitySchema,
  '/activity/update': updateSchema,
  '/create-user': userSchema,
};