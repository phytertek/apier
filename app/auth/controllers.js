const User = require('../database').User
const { encode, decode } = require('./utils/jwt')
const { sendUserError, throwError } = require('../common/errors')
const { requireFields } = require('../common/validation')
const {
  objectFromExistingFields: existing,
  dbDocumentUpdateFromExistingFields: updateIfExists
} = require('../common/utils')

module.exports = {
  registerUser: async (req, res) => {
    try {
      const { username, password, firstName, lastName, email } = req.body
      requireFields({ username, password })
      const userFromReq = existing({
        username,
        password,
        firstName,
        lastName,
        email
      })
      const user = await new User(userFromReq)
      const token = await encode({ _id: user._id, username })
      user.activeTokens.push(token)
      await user.save()
      res.json({ token })
    } catch (error) {
      sendUserError(error, res)
    }
  },
  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body
      requireFields({ username, password })
      const user = await User.findOne({ username })
      if (!user) throwError('not a valid username / password combination')
      const passwordMatch = await user.checkPassword(password)
      if (!passwordMatch)
        throwError('not a valid username / password combination')
      const token = await encode({ _id: user._id, username })
      user.activeTokens.push(token)
      await user.save()
      res.json({ token })
    } catch (error) {
      sendUserError(error, res)
    }
  },
  updateUser: async (req, res) => {
    try {
      const token = req.get('Authorization')
      const { _id } = await decode(token)
      const user = await User.findOne({ _id })
      const { username, password } = req.body
      const updatedUser = await updateIfExists(user, {
        username,
        password
      }).save()
      console.log(updatedUser)
      res.json(updatedUser)
    } catch (error) {
      sendUserError(error, res)
    }
  },
  logoutUser: async (req, res) => {
    try {
      const token = req.get('Authorization')
      const { _id } = await decode(token)
      const user = await User.findById(_id)
      const tokenRemoved = user.activeTokens.filter(t => t !== token)
      user.activeTokens = tokenRemoved
      await user.save()
      res.json({ success: 'User successfully logged out' })
    } catch (error) {
      sendUserError(error, res)
    }
  }
}
