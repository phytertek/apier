const winston = require('winston');
const { Config } = require('../../appConfig');

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: Config.Level === 'production' ? 'info' : 'debug',
      colorize: true,
      timestamp: true,
      prettyPrint: true,
      label: Config.Name
    })
  ]
});

logger.stream = {
  write: message => logger.info(message)
};

module.exports = logger;
