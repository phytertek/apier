const mongoose = require('mongoose')

module.exports = appModel =>
  Object.keys(appModel).reduce((DB, Model) => {
    const SchemaEntries = appModel[Model].reduce(
      (r, e) => ({ ...r, ...e.Schema }),
      {}
    )
    const ModelSchema = new mongoose.Schema(SchemaEntries)
    appModel[Model].forEach(e => {
      if (e.Hooks) e.Hooks(ModelSchema)
      if (e.Methods) e.Methods(ModelSchema)
    })
    DB[Model] = mongoose.model(Model, ModelSchema)
    return DB
  }, {})
