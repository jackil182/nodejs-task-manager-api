const express = require('express');

require('./db/mongoose');
const userRouter = require('./routers/userRoutes');
const taskRouter = require('./routers/taskRoutes');

const app = express();
const port = process.env.PORT;

// middleware for maintenance mode
// app.use((req, res, next) => {
//   res.status(503).send('The website is temporarily unavailable. Please, try again later');
// });

app.use(express.json());

app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log(`server listening on ${port}`);
});

// referencing collections in Mongo
// const Task = require('./models/task');
// const User = require('./models/user');

// const main = async() => {
// one way to connect (relate) collections is by using 'ref' on the field in Schema and using 'populate' method, then 'execPopulte() on the document;
// const task = await Task.findById('5cb6301265e7ea9cd9a8b749');
// await task.populate('owner').execPopulate();
// console.log(task.owner);

// another wat to connect collections is to use 'virtual' method on Schema (check out User.js)
// const user = await User.findById('5cb62fff65e7ea9cd9a8b747');
// await user.populate('tasks').execPopulate();
// console.log(user.tasks);
// }

// main();

// an example of how to upload files
// const multer = require('multer');
// const upload = multer({
//   dest: 'images',
//   limits: {
//     fileSize: 1000000 // 1mb
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.docx?$/)) {
//       return cb(new Error('Please, upload a Word document'));
//     }

//     cb(undefined, true);
//   }
// });

// app.post(
//   '/upload',
//   upload.single('upload'),
//   (req, res) => {
//     res.send('yes');
//   },
//   (err, req, res, next) => {
//     res.status(400).send({ error: err.message });
//   }
// );
