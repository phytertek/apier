module.exports = appConfig =>
  Object.keys(appConfig.Components).reduce((Model, key) => {
    const schemaPath = `../../${key.toLowerCase()}/schema`
    const componentSchema = require(schemaPath)
    if (componentSchema) {
      Object.keys(componentSchema).forEach(k => {
        if (!Model[k]) Model[k] = [componentSchema[k]]
        else Model[k] = [...Model[k], componentSchema[k]]
      })
    }
    return Model
  }, {})
