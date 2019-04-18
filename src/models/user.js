const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Task = require('./task');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      default: 0,
      validate(val) {
        if (val < 0) throw new Error('Age must be a positive number');
      }
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(val) {
        if (!validator.isEmail(val))
          throw new Error('You must provide a valid email');
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      // minlength: 6, // built-in validation
      validate(val) {
        if (val.length < 6 || val.toLowerCase().includes('password'))
          throw new Error(
            'Password must be at leat 6 symbols long and not contain the word "password"'
          );
      }
    },
    avatar: {
      type: Buffer
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// one way to connect collections is by applying 'virtual' method on Schema
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
});

// one way to hide unnecessary properties from the user, when sending response
// userSchema.methods.getPublicProfile = function() {
//   const user = this;
//   const userObj = user.toObject();
//   delete userObj.password;
//   delete userObj.tokens;

//   return userObj;
// }

// another way to hide unnecessary (sensitive) info (! method MUST be named "toJSON" !)
userSchema.methods.toJSON = function() {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.tokens;
  delete userObj.avatar;

  return userObj;
};

userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = [...user.tokens, { token }];
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  // console.log(user);
  if (!user) throw new Error('Unable to login. Please, check your email');

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect)
    throw new Error('Unable to login. Please, check your password');

  return user;
};

// Hash the plain text password
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// delete all user tasks, when the user is removed
userSchema.pre('remove', async function(next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
