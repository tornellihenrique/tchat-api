const app = require('express')();
const bodyParser = require('body-parser');
const passport = require('passport');
const socket = require('socket.io');
const morgan = require('morgan');
const cors = require('cors');
const logger = require('./config/winston');
const port = process.env.PORT || 5000;

require('./config/db')();

try {
  app.use(morgan('combined', { stream: logger.stream }));
  app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = err;
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500);
    res.render('error');
  });
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(passport.initialize());
  app.use(cors());

  const passportMiddleware = require('./middleware/passport');
  passport.use(passportMiddleware);

  app.use('/api', require('./routes'));

  const http = require('http').createServer(app);

  const io = (module.exports.io = socket(http));
  io.on('connection', require('./socket'));

  http.listen(port, () => {
    logger.log({ level: 'info', message: `Server running at http://localhost:${port}` });
  });
} catch (e) {
  console.error(e);
}
