const { User, Token } = require('../database');
const Assignments = require('../database').Assignments;
const { generateUserToken, decode } = require('./utils/jwt');
const { sendUserError, throwError } = require('../common/errors');
const { requireFields } = require('../common/validation');
const {
  objectFromExistingFields: existing,
  dbDocumentUpdateFromExistingFields: updateIfExists
} = require('../common/utils');
const logger = require('../common/logger');

module.exports = {
  registerUser: async (req, res) => {
    try {
      const { password, firstName, lastName, email } = req.body;
      requireFields({ email, password });
      const newUserFromReq = existing({
        password,
        firstName,
        lastName,
        email
      });
      const user = new User(newUserFromReq);
      const newUserToken = await generateUserToken(user, req);
      const token = await new Token(newUserToken).save();
      user.activeTokens.push(token);
      await user.save();
      logger.info(`New User Created: ${user._id}`);
      res.json({ token });
    } catch (error) {
      sendUserError(error.message, res);
    }
  },
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      requireFields({ email, password });
      const user = await User.findOne({ email });
      if (!user) throwError('not a valid email / password combination');
      const passwordMatch = await user.checkPassword(password);
      if (!passwordMatch)
        throwError('not a valid email / password combination');
      // if (user.activeTokens.length > 0)
      const token = await new Token(await generateUserToken(user, req)).save();
      user.activeTokens.push(token._id);
      await user.save();
      console.log(token);
      res.json({ token: token.data });
    } catch (error) {
      sendUserError(error, res);
    }
  },
  updateUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      const updatedUser = await updateIfExists(req.unsafeUser, {
        email,
        password
      }).save();
      res.json(updatedUser);
    } catch (error) {
      sendUserError(error, res);
    }
  },
  logoutUser: async (req, res) => {
    try {
      const token = req.get('Authorization');
      const { _id } = await decode(token);
      const user = await User.findById(_id);
      const tokenRemoved = user.activeTokens.filter(t => t !== token);
      user.activeTokens = tokenRemoved;
      await user.save();
      res.json({ success: 'User successfully logged out' });
    } catch (error) {
      sendUserError(error, res);
    }
  },
  makeSystemAdmin: async (req, res) => {
    try {
      const admins = await User.find({
        systemAdministrator: true
      });
      if (admins.length !== 0) {
        throwError(
          'Master system admin already exists, you cannot make a new one by this method'
        );
      }
      req.unsafeUser.systemAdministrator = true;
      await req.unsafeUser.save();
      logger.info(
        '!!! <<< !!! <<< FIRST RUN SYSTEM ADMIN CREATED >>> !!! >>> !!!'
      );
      logger.info(`New System Admin: ${req.unsafeUser._id}`);
      res.json({
        success: `Current user ${req.unsafeUser
          .email} has been designated a system administrator`
      });
    } catch (error) {
      sendUserError(error, res);
    }
  },
  addRouteAdmin: async (req, res) => {
    try {
      const { _id, route } = req.body;
      requireFields({ route, _id });
      if (
        !(
          req.unsafeUser.systemAdministrator ||
          req.unsafeUser.administratorRoutes.includes(route)
        )
      ) {
        throwError('No admin rights on this route');
      }
      const user = await User.findById(_id);
      user.administratorRoutes.push(route);
      await user.save();
      res.json({ success: `${user.email} is now an admin at ${route}` });
    } catch (error) {
      sendUserError(error, res);
    }
  }
};
