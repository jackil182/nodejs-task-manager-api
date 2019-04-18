const jwt = require('jsonwebtoken');
const User = require('../models/user');

// check if user is authenticated. if not, next is not called;
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    // { _id: '5cb39e77dae04ba5e1dbb91f', iat: 1555428982 }
    const user = await User.findOne({_id: decoded._id, 'tokens.token': token});

    if(!user) throw new Error('No such user');

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({error: "Authentication failed"});
  }
};

module.exports = auth;