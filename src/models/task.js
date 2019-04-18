const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User' // the name should precisely match the name of the collection we want to link to
    }
  },
  {
    timestamps: true
  }
);

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;

// const newTask = new Task({
//   description: ' exercise for 15 minutes      ',
//   // completed: false
// });

// newTask
//   .save()
//   .then(res => console.log(res))
//   .catch(err => console.log(err));
