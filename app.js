const express = require('express');
const dotenv = require('dotenv');
const userRoute = require('../routes/user')
const activityRoute = require('../routes/activity')
const app = express();


app.use(express.urlencoded({ extended: false }));
dotenv.config();

app.use(express.json());
app.use('/user', userRoute)
app.use('/activity', activityRoute)

  app.get('/', (req, res) => {
    res.send('to-do-app.com');
  });

//   app.post('/to-do/create-user', async (req, res, next) => {
//     const { username, password } = req.body;
    
//     if (password.length < 6) {
//       return res
//         .status(400)
//         .json({ message: 'Password less than 6 characters' });
//     }

//     const exist = await User.findOne({ username });

//     if (exist.username == username) {
//       return res
//         .status(400)
//         .json({ message: 'Username already exists' });
//     }
//     try {
//     await createUser(
//       username,
//       password
//     )
//       .then((user) =>
//         res.status(200).json({
//           message: "User successfully created",
//           id: user._id
//         })
//       )
//       .catch((error) =>
//         res.status(400).json({
//           message: "User not successful created",
//           error: error.message,
//         })
//       );
//   }catch (error) {
//     res.status(400).json({
//       message: "An error occurred",
//       error: error.message,
//     });
//   } 
// })

//   app.post('/to-do/login', async (req, res, next) => {
//     const { username, password } = req.body;

//     try {
//       const user = await loginUser(username, password);
//         if (!user) {
//           res.status(400).json({ message: 'Invalid username or password' });
//         }else{
//           const maxAge = 3 * 60 * 60;
//           const token = jwt.sign(
//             { id: user._id, username },
//             process.env.SECRET_TOKEN,
//             {
//               expiresIn: maxAge, 
//             }
//           );
//           res.status(201).json({
//             message: "User successfully Logged in",
//             user: user._id,
//             token: token
//           });
//         } 
//     }catch (error) {
//     res.status(400).json({
//       message: "An error occurred",
//       error: error.message,
//     });
//   }
//     }
//   );

//   app.post('/to-do/create-activity', verifyToken, async (req, res, next) => {
//     const { user_id, name, category, date, isPublished, priority } = req.body;

//     try {
//       const activity = await createActivity(
//         user_id,
//         name,
//         category,
//         date,
//         isPublished,
//         priority
//       );
//       return res
//         .status(200)
//         .json({ data: activity, success: true, message: 'Activity created' });
//     } catch (error) {
//       return next(error);
//     }
//   });

  
//     app.put('/to-do/update-activity', verifyToken, async (req, res, next) => {
//     const { id, name, priority, category } = req.body;

//     try {
//       const activity = await updateActivity(id, name, category, priority);
//       return res
//         .status(200)
//         .json({ data: activity, success: true, message: 'Activity updated' });
//     } catch (error) {
//       return next(error);
//     }
//   }); 

//   app.get('/to-do/fetch', verifyToken, async (req, res, next) => {
//     const { user_id } = req.body;

//     try {
//       const activity = await fetchById(user_id);
//       return res.status(200).json({
//         data: activity,
//         success: true,
//         message: 'Activity retrieved',
//       });
//     } catch (error) {
//       return next(error);
//     }
//   });




app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port  ${process.env.PORT}....`);
});


