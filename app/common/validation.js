const isEmail = require('validator/lib/isEmail');

module.exports = {
  requireFields: fields => {
    Object.keys(fields).forEach(key => {
      if (!fields[key]) {
        throw new Error(`${Object.keys(fields).join(', ')} are required`);
      }
    });
  },
  validateEmail: field => {
    if (!!!isEmail(field)) throw new Error('Not a valid email address');
  }
};
