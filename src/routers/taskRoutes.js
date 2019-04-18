const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/task');

// add task for logined user
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// get all tasks from all users
router.get('/tasksAll', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

// get all tasks for logined user
// add custom filtering via req.query (ex ?completed=true; limit=10; skip=50; sortBy=createdAt:asc)
router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    // since the value of the query is a string, we check if it equals to string "true"
    match.completed = req.query.completed === 'true';
  };

  if (req.query.sortBy) {
    console.log('aaa');
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === "asc" ? 1 : -1;
  };

  try {
    // one way to find is by owner
    // const tasks = await Task.find({owner: req.user._id});

    // another way to find is by using populate on the user (using virtual schema method)
    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: Number.parseInt(req.query.limit),
          skip: Number.parseInt(req.query.skip),
          sort,
        }
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

// get task by id only if it belongs to logined user
router.get('/tasks/:id', auth, async (req, res) => {
  try {
    // const task = await Task.findById(req.params.id);
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!task) return res.status(404).send('Task not found');
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

// delete task by id if it belongs to logined user
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });
    // const tasksToCompleteCount = await Task.countDocuments({
    //   completed: false
    // });
    if (!deletedTask) return res.status(400).send('No such task to delete');
    // res.json({ 'Tasks to complete count': tasksToCompleteCount });
    res.send(deletedTask);
  } catch (e) {
    res.status(500).send(e);
  }

  // Task.findByIdAndDelete(req.params.id).then((doc) => {
  //   if (!doc) return res.status(400).send('No such task to delete');

  //   res.send(doc);
  //   return Task.countDocuments();
  // }).then((remainingDocs) => {
  //   console.log(remainingDocs);
  // }).catch((err) => {
  //   res.status(500).send(err)
  // });
});

// update task by id if it belongs to logined user
router.patch('/tasks/:id', auth, async (req, res) => {
  const allowedUpdates = ['description', 'completed'];
  const userTriedToUpdate = Object.keys(req.body);
  const isValidOperation = userTriedToUpdate.every(el =>
    allowedUpdates.includes(el)
  );

  if (!isValidOperation)
    return res
      .status(400)
      .send('Invalid operation. Some of the fields cannot be updated');

  try {
    // const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

    const updatedTask = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!updatedTask) return res.status(404).send('No such task to update');

    userTriedToUpdate.forEach(el => (updatedTask[el] = req.body[el]));
    await updatedTask.save();

    res.send(updatedTask);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;
