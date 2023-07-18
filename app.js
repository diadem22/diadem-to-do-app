const express = require('express');
const dotenv = require('dotenv');
const userRoute = require('./routes/user')
const activityRoute = require('./routes/activity')
const app = express();


app.use(express.urlencoded({ extended: false }));
dotenv.config();

app.use(express.json());
app.use('/user', userRoute)
app.use('/activity', activityRoute)

  app.get('/', (req, res) => {
    res.send('to-do-app.com');
  });


app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port  ${process.env.PORT}....`);
});


