const express = require('express')
// pull in configuration object
const appConfig = require('../../appConfig')

const server = express()

// add server middleware
require('./middleware/bodyParser')(server)
require('./middleware/cors')(server)

// build Routes
require('./utils/buildRoutes')(appConfig, server, express)

// Handle unspecified routes
server.use((req, res) =>
  res.status(404).json({
    error: `Unable to resolve ${req.originalUrl}`
  })
)

// connect server
const { Name, Host, Port } = appConfig.Config

server.listen(Port, error => {
  if (error) return console.error(`Error starting ${Name} server`, error)
  console.log(`${Name} server running at ${Host}:${Port}`)
})
