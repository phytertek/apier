const User = require('../database').User
const { decodeToken } = require('../services').Auth
const { sendUserError } = require('../common/errors')
const { requireFields } = require('../common/validation')
const { objectFromExistingFields: existing } = require('../common/utils')

module.exports = {
  updateUser: async (req, res) => {
    try {
      const token = req.get('Authorization')
      const { _id } = await decodeToken(token)
      const { firstName, lastName, email } = req.body
      const update = existing({ firstName, lastName, email })
      const updatedUser = await User.updateOne({ _id }, update)
      res.json({ success: true })
    } catch (error) {
      sendUserError(error, res)
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select(
        'firstName lastName username email'
      )
      res.json(users)
    } catch (error) {
      sendUserError(error, res)
    }
  }
}
