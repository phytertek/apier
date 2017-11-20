const morgan = require('morgan');

module.exports = (server, logger) =>
  server.use(morgan('combined', { stream: logger.stream }));
