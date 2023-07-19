const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoute = require('./routes/user');
const activityRoute = require('./routes/activity')
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/user', userRoute)
app.use('/activity', activityRoute)

  app.get('/', (req, res) => {
    res.send('to-do-app.com');
  });


app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port  ${process.env.PORT}....`);
});


