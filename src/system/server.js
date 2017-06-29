const app = require('system/app')
const environment = require('services/environment')
const EventEmitter = require('event-emitter')

module.exports = class Server {
  constructor () {
    // initialization of the properties
    this.emitter = new EventEmitter()

    this._initialize()
  }

  _initialize () {
    app.listen(environment.get('PORT'), () => {
      this.emitter.emit('serverReady', {
        'port': environment.get('PORT')
      })
    })
  }
}
