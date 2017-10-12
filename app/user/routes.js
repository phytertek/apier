const { updateUser, getAllUsers } = require('./controllers')
const { authorizeRoute } = require('../services').Auth

module.exports = {
  '/user': {
    middleware: authorizeRoute,
    patch: {
      '/update': updateUser
    },
    get: {
      '/get-all': getAllUsers
    }
  }
}
