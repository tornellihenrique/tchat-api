const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const morgan = require('morgan');
const db = require('./config/db');
const logger = require('./config/winston');
const port = process.env.PORT || 5000;

const app = express();

app.use(morgan('combined', { stream: logger.stream }));
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = err;
  winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500);
  res.render('error');
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

const passportMiddleware = require('./middleware/passport');
passport.use(passportMiddleware);

app.get('/', (req, res) => {
  return res.send(`Hello! The API is at http://localhost:${port}/api`);
});

app.use('/api', require('./routes'));

db();

app.listen(port);
logger.log({ level: 'info', message: `Server running at http://localhost:${port}` });