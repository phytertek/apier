// pull in configuration object
const appConfig = require('../../appConfig')

// build Services
const Services = require('./utils/buildServices')(appConfig)

module.exports = Services
