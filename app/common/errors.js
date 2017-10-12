module.exports = {
  sendUserError: (err, res) => {
    res.status(422)
    if (err && err.message) {
      res.json({ message: err.message, stack: err.stack })
    } else {
      res.json({ error: err })
    }
  },

  throwError: err => {
    throw new Error(err)
  }
}
