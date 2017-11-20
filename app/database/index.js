const mongoose = require('mongoose');
// logger
const logger = require('../common/logger');
// pull in configuration object
const appConfig = require('../../appConfig');

// pull out database model from config object
const appModel = require('./utils/buildModel')(appConfig);

// build database
const DB = require('./utils/buildDB')(appModel);

// connect DB
const { DatabaseName, DatabaseURI } = appConfig.Config;

mongoose.Promise = global.Promise;

const options = {
  useMongoClient: true,
  promiseLibrary: global.Promise
};

mongoose.connect(DatabaseURI, options, error => {
  if (error) return logger.error(`Error connecting to ${DatabaseName}`, error);
  logger.info(`${DatabaseName} connected successfully`);
});

module.exports = DB;
