const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoute = require('./src/routes/user');
const activityRoute = require('./src/routes/activity')
const dotenv = require('dotenv');
const { connectToDatabase } = require('./index');

connectToDatabase();

dotenv.config();
const app = express();

app.use(cors())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/user', userRoute)
app.use('/activity', activityRoute)

  app.get('/', (req, res) => {
    res.send('diadem-amd-gbensky.com');
  });


app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port  ${process.env.PORT}....`);
});


