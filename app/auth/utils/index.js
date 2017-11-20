module.exports = {
  safeReturnUser: user => {
    const safeUser = user.toObject();
    const unsafeProps = [
      'password',
      'activeTokens',
      'systemAdministrator',
      'administratorRoutes'
    ];
    unsafeProps.forEach(prop => {
      delete safeUser[prop];
    });
    return safeUser;
  }
};
