const { updateUser, getAllUsers, getCurrentUser } = require('./controllers');
const { authorizeRoute, authorizeAdminRoute } = require('../services').Auth;

module.exports = {
  '/user': {
    middleware: authorizeRoute,
    post: {
      '/update': updateUser
    },
    get: {
      '/all': [authorizeAdminRoute, getAllUsers],
      '/current': getCurrentUser
    }
  }
};
