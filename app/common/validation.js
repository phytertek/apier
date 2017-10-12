module.exports = {
  requireFields: fields => {
    Object.keys(fields).forEach(key => {
      if (!fields[key]) {
        throw new Error(`${Object.keys(fields).join(', ')} are required`)
      }
    })
  }
}
