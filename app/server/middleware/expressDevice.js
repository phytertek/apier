const device = require('express-device');
module.exports = server => {
  server.use(device.capture());
};
