// pull out services config from object
module.exports = appConfig =>
  Object.keys(appConfig.Components).reduce((Services, key) => {
    if (appConfig.Components[key].Services) {
      const servicesPath = `../../${key.toLowerCase()}/services`
      const componentServices = require(servicesPath)
      Services[key] = componentServices
    }
    return Services
  }, {})
