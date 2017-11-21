const User = require('../database').User;
const { encode, decode, compareUserToken } = require('./utils/jwt');
const { sendUserError, throwError } = require('../common/errors');
const { requireFields } = require('../common/validation');
const { safeReturnUser } = require('./utils');
module.exports = {
  authorizeAdminRoute: async (req, res, next) => {
    try {
      const reqMethod = req.method;
      const endpoint = `${reqMethod}${req.originalUrl}`;
      if (
        !req.unsafeUser.systemAdministrator &&
        !req.unsafeUser.administratorRoutes.includes(endpoint)
      )
        throwError('Not an active admin token');
      next();
    } catch (error) {
      sendUserError(error, res);
    }
  },
  generateRouteList: (verbs, endpoint) => verbs.map(v => `${v}${endpoint}`),
  setUserAdminForRoutes: (user, routes) => {
    const newUserRoutes = [...user.administratorRoutes, ...routes];
    user.administratorRoutes = newUserRoutes;
    return user;
  },
  removeUserAdminForRoutes: (user, routes) => {
    const newUserRoutes = user.administratorRoutes.filter(
      r => !routes.includes(r)
    );
    user.administratorRoutes = newUserRoutes;
    return user;
  },
  authorizeRoute: async (req, res, next) => {
    try {
      req.token = req.get('Authorization');
      if (!!!req.token) throw new Error('No token provided');

      req.decodedToken = await decode(req.token);

      const user = await User.findById(req.decodedToken._id).populate({
        path: 'activeTokens',
        model: 'Token'
      });
      if (!!!user) throwError('No user found');

      const tokenMatch = await compareUserToken(user, req);
      if (tokenMatch !== 'Success') throwError('Not an active token');

      req.unsafeUser = user;
      req.safeUser = safeReturnUser(user);
      next();
    } catch (error) {
      sendUserError(error, res);
    }
  },
  decodeToken: async token => {
    try {
      const decoded = await decode(token);
      return decoded;
    } catch (error) {
      throwError(error);
    }
  }
};
