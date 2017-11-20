const {
  addRouteAdmin,
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
  makeSystemAdmin
} = require('./controllers');
const { authorizeRoute, authorizeAdminRoute } = require('../services').Auth;

module.exports = {
  '/auth': {
    post: {
      '/register': registerUser,
      '/update': [authorizeRoute, updateUser],
      '/login': loginUser
    },
    get: {
      '/logout': [authorizeRoute, logoutUser]
    }
  },
  '/admin': {
    middleware: [authorizeRoute],
    post: {
      '/makeSystemAdmin': makeSystemAdmin,
      '/add-route-admin': [authorizeAdminRoute, addRouteAdmin]
    }
  }
};
