const mongoose = require('mongoose');
const logger = require('./winston');
const config = require('./config');

module.exports = () => {
  mongoose.connect(config.db, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

  const connection = mongoose.connection;

  connection.once('open', () => {
    logger.log({ level: 'info', message: `MongoDB database connection established successfully!` });
  });

  connection.on('error', err => {
    logger.error(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
  });
};
