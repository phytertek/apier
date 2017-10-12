const cors = require('cors')

const options = {
  credentials: true
}

module.exports = server => server.use(cors(options))
