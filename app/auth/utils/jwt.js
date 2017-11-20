const jwt = require('jwt-simple');

const { JWTSecret } = require('../../../appConfig').Config;

const encode = async ({ _id, email }) => {
  try {
    const token = await jwt.encode(
      {
        _id,
        email,
        iat: new Date().getTime()
      },
      JWTSecret
    );
    return token;
  } catch (error) {
    throw new Error(error);
  }
};

const decode = async token => {
  try {
    const user = await jwt.decode(token, JWTSecret);
    return user;
  } catch (error) {
    throw new Error(error);
  }
};

const generateUserToken = async (user, req) => {
  try {
    if (!!!user) {
      throw new Error('No user to generate token for');
    }
    const token = await encode(user);
    return {
      user: user._id,
      data: token,
      source: {
        deviceType: req.device.type,
        ipAddress: req.ip
      }
    };
  } catch (error) {
    throw new Error(error);
  }
};
const compareUserToken = async (user, req) => {
  try {
    const reqToken = req.token;
    if (!!!user.activeTokens || !!!reqToken)
      throw new Error('No token provided');

    const userToken = user.activeTokens.find(t => t.data === reqToken);
    if (!!!userToken) throw new Error('No active tokens provided');
    if (
      userToken.source.deviceType !== req.device.type ||
      userToken.source.ipAddress !== req.ip
    )
      throw new Error('Not a valid token');

    return 'Success';
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  encode,
  decode,
  generateUserToken,
  compareUserToken
};
