const User = require('../models/user');
const Token = require('../utils/token');
const logger = require('../config/winston');

const registerUser = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ msg: 'You need to send email and password' });
  }

  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(400).json({ msg: err });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    let newUser = User(req.body);
    newUser.save((err, user) => {
      if (err) return res.status(400).json({ msg: err });

      return res.status(201).json(user);
    });
  });
};

const loginUser = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ msg: 'You need to send email and password' });
  }

  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(400).json({ msg: err });
    if (!user) return res.status(400).json({ msg: 'User does not exist' });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (isMatch && !err) {
        return res.status(200).json({ token: Token.createToken(user) });
      } else {
        return res.status(400).json({ msg: "Email and password don't match" });
      }
    });
  });
};

module.exports = {
  registerUser,
  loginUser,
};
