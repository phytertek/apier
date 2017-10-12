const {
  registerUser,
  loginUser,
  logoutUser,
  updateUser
} = require('./controllers')
const { authorizeRoute } = require('../services').Auth

module.exports = {
  '/auth': {
    post: {
      '/register': registerUser,
      '/login': loginUser
    },
    patch: {
      '/update': [authorizeRoute, updateUser]
    },
    head: {
      '/logout': logoutUser
    }
  }
}
