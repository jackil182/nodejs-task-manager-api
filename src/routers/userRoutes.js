const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account');

// sign up user
router.post('/users', async (req, res) => {
  try {
  const user = new User(req.body);
  const token = await user.generateAuthToken();

    await user.save();
    // one way to send info about user, without password and tokens array (custom method)
    // res.status(201).send({ user: user.getPublicProfile(), token });

    // second (better) way to hide sensitive info (uses toJSON custom method)

    // send email to user after they were saved
    sendWelcomeEmail(user.email, user.name);

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// login user
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    if (!user) return res.status(400).send('error');
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.send(String(e));
  }
});

// logout user
router.post('/users/logout', auth, async (req, res) => {
  try {
    // remove the current token from the tokens array to sign out from the current devicee
    req.user.tokens = req.user.tokens.filter(el => el.token !== req.token);

    await req.user.save();

    res.send('User logged out');
  } catch (err) {
    res.status(500).send(err);
  }
});

// logout user from all devices
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();

    res.send('All user sessions are closed');
  } catch (error) {
    res.status(500).send(err);
  }
});

// read all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send(e);
  }
});

// read logined user
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

// read user by id
// removed, because other users should not be able to get other users' info
// router.get('/users/:id', async (req, res) => {
//   const id = req.params.id;

//   try {
//     const user = await User.findById(id);

//     if (!user) return res.status(404).send('User not found');

//     res.send(user);
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });

// update (edit) user
router.patch('/users/me', auth, async (req, res) => {
  const allowedUpdates = ['name', 'age', 'email', 'password'];
  const userTriedToUpdate = Object.keys(req.body);
  const isValidOperation = userTriedToUpdate.every(el =>
    allowedUpdates.includes(el)
  );

  if (!isValidOperation)
    return res
      .status(400)
      .send('Invalid operation. Some of the fields cannot be updated');

  try {
    // const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

    // if middleware is needed, like password hashing, we must updated documents in three steps, instead of one (find, update, save)

    // decided to change to another method, since the user is already authenticated, so there's no need to find him from db
    // const updatedUser = await User.findById(req.params.id);
    // userTriedToUpdate.forEach(el => (updatedUser[el] = req.body[el]));
    // await updatedUser.save();

    // if (!updatedUser) return res.status(404).send('No such user to update');

    // res.send(updatedUser);

    userTriedToUpdate.forEach(el => (req.user[el] = req.body[el]));
    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// delete user
router.delete('/users/me', auth, async (req, res) => {
  try {
    // no need to do the following, since we're using middleware, which has info about the current user
    // const deletedUser = await User.findByIdAndDelete(req.params.id);

    // if (!deletedUser) return res.status(404).send('No such user to delete');

    // res.send(deletedUser);

    await req.user.remove();

    sendGoodbyeEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

const uploadAvatar = multer({
  // dest: 'avatar', // remove this if don't need to store the upload in the file system, but rather in req.file
  limits: {
    fileSize: 1000000 // 1mb
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpe?g|png)$/)) {
      return cb(new Error('Please, upload an image file (.jpg, .jpeg, .png)'));
    }

    cb(undefined, true);
  }
});

router.post(
  '/users/me/avatar',
  auth,
  uploadAvatar.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (err, req, res, next) => {
    res.status(400).send({error: err.message});
  }
);

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined,
  await req.user.save();
  res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
      const user = await User.findById(req.params.id);

      if(!user || !user.avatar) {
        throw new Error();
      }

      res.set('Content-Type', 'image/jpg');
      res.send(user.avatar)
  } catch (err) {
    res.status(404).send()
  }
})

module.exports = router;
