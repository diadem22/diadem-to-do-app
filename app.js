const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt')
const app = express();
const {
  createActivity,
  updateActivity,
  fetchById,
} = require('./controllers/activity');
const { createUser, loginUser } = require('./controllers/user')

app.use(express.urlencoded({ extended: false }));
dotenv.config();

app.use(express.json());

  app.get('/', (req, res) => {
    res.send('to-do-app.com');
  });

  app.post('/to-do/create-user', async (req, res, next) => {
    const { name, password, role } = req.body;


    bcrypt.hash(password, 10).then(async (hash) => {
    await createUser({
      name,
      password: hash,
    })
      .then((user) => {
        const maxAge = 3 * 60 * 60;
        const token = jwt.sign(
          { username, role: user.role },
          process.env.SECRET_TOKEN,
          {
            expiresIn: maxAge, 
          }
        );
        res.cookie('jwt', token, {
          httpOnly: true,
          maxAge: maxAge * 1000, 
        });
        res.status(201).json({
          message: 'User successfully created',
          user: user._id,
        });
      })
      .catch((error) =>
        res.status(400).json({
          message: 'User not successful created',
          error: error.message,
        })
      );
  })
  });

  app.get('/to-do/login', async (req, res, next) => {
    const { name, password } = req.body;

    try {
      const user = await loginUser(name, password);
      if (user) {
        return res.json({
          token: jsonwebtoken.sign({ user: user.role }, process.env.SECRET_TOKEN),
        });
      } else {
        res.status(401).json(
          { message: "The username and password your provided are invalid" }
        );
      }
    } catch (error) {
      res.status(400).json({
        message: 'An error occurred',
        error: error.message,
      });
    }
  });

  app.post('/to-do/create-activity', async (req, res, next) => {
    const { user_id, name, category, date, isPublished, priority } = req.body;

    try {
      const activity = await createActivity(
        user_id,
        name,
        category,
        date,
        isPublished,
        priority
      );
      return res
        .status(200)
        .json({ data: activity, success: true, message: 'Activity created' });
    } catch (error) {
      return next(error);
    }
  });

  
    app.put('/to-do/update-activity', async (req, res, next) => {
    const { id, name, priority, category } = req.body;

    try {
      const activity = await updateActivity(id, name, category, priority);
      return res
        .status(200)
        .json({ data: activity, success: true, message: 'Activity updated' });
    } catch (error) {
      return next(error);
    }
  }); 

  app.get('/to-do/fetch', async (req, res, next) => {
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




app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port  ${process.env.PORT}....`);
});


// fb096c53fa0b5d2c0813f6de17bd0e85fa1ebf0c43dfac57bc5c895cfcc201b07329f6;

