const app = require('system/app')
const controllers = require('controllers')

module.exports = () => {
  // Include the controllers
  app.use(controllers)
}
