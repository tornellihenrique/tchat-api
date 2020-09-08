const appRoot = require('app-root-path');
const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: `${appRoot}/logs/app.log`,
      handleExceptions: true,
      format: winston.format.json(),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
      colorize: true,
    }),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

logger.stream = {
  write: (message, encoding) => {
    logger.info(message);
  },
};

module.exports = logger;
