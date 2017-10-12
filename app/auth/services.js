const User = require('../database').User
const { encode, decode } = require('./utils/jwt')
const { sendUserError, throwError } = require('../common/errors')
const { requireFields } = require('../common/validation')

module.exports = {
  authorizeRoute: async (req, res, next) => {
    try {
      const token = req.get('Authorization')
      const { _id } = await decode(token)
      const user = await User.findById(_id)
      const tokenMatch = user.activeTokens.indexOf(token) !== -1
      if (!tokenMatch) throwError('Not an active token')
      next()
    } catch (error) {
      sendUserError(error, res)
    }
  },
  decodeToken: async token => {
    try {
      const decoded = await decode(token)
      return decoded
    } catch (error) {
      throwError(error)
    }
  }
}
