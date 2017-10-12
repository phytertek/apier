const bodyParser = require('body-parser')

module.exports = server => server.use(bodyParser.json())
