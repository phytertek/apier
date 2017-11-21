const User = require('../database').User;
const { decodeToken } = require('../services').Auth;
const { sendUserError } = require('../common/errors');
const { requireFields } = require('../common/validation');
const {
  dbDocumentUpdateFromExistingFields: existing
} = require('../common/utils');

module.exports = {
  updateUser: async (req, res) => {
    try {
      const { firstName, lastName, email } = req.body;
      const currentUser = req.unsafeUser;
      const updatedUser = existing(currentUser, { firstName, lastName, email });
      await updatedUser.save();
      res.json({ success: true });
    } catch (error) {
      sendUserError(error, res);
    }
  },
  getCurrentUser: async (req, res) => {
    try {
      res.json(req.safeUser);
    } catch (error) {
      sendUserError(error, res);
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select('firstName lastName email');
      res.json(users);
    } catch (error) {
      sendUserError(error, res);
    }
  }
};
