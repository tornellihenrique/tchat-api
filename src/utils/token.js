const jwt = require('jsonwebtoken');
const config = require('../config/config');

const createToken = user => {
  return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: 86400,
  });
};

module.exports = {
  createToken,
};
