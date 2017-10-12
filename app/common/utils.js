module.exports = {
  objectFromExistingFields: fields =>
    Object.keys(fields).reduce((r, f) => {
      if (fields[f]) r[f] = fields[f]
      return r
    }, {}),
  dbDocumentUpdateFromExistingFields: (dbDoc, fields) =>
    Object.keys(fields).reduce((doc, f) => {
      if (fields[f] && doc[f]) doc[f] = fields[f]
      return doc
    }, dbDoc)
}
