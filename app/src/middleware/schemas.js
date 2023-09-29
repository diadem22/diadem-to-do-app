const Joi = require('joi');

const activitySchema = Joi.object().keys({
  name: Joi.string().required(),
  category: Joi.string()
    .required()
    .valid('spiritual', 'career', 'exercise', 'personal'),
  date: Joi.date(),
  isPublished: Joi.boolean(),
  priority: Joi.string().required().valid('high', 'low'),
  time: Joi.string()
    .required()
    .pattern(new RegExp(/^(?:[01]\d|2[0-3]):[0-5]\d$/))
    .message('Time must be in HH:mm format (e.g., "09:00").'),
});

const updateSchema = Joi.object().keys({
  activity_id: Joi.string().required(),
  category: Joi.string().valid('spiritual', 'career', 'exercise', 'personal'),
  date: Joi.date(),
  isPublished: Joi.boolean(),
  priority: Joi.string().valid('high', 'low'),
  status: Joi.string().valid('not-done', 'in-progress', 'completed'),
});

const userCreateSchema = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().min(6).required().strict()
});

const userLoginSchema = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const schemas = {
  '/activity/create': activitySchema,
  '/activity/update': updateSchema,
  '/user/create': userCreateSchema,
  '/user/login': userLoginSchema,
};

module.exports =  schemas 