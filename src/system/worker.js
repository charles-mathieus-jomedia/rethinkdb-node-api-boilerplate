const controllers = require('system/controllers')
const Server = require('system/server')

// Each worker will go in that function
module.exports = () => {
  const server = new Server()

  server.emitter.on('serverReady', () => {
  })

  // Init the controllers
  controllers()
}
