const _ = require('lodash')
const EventEmitter = require('event-emitter')
const logger = require('services/logger')

module.exports = class Task {
  constructor (callback, options) {
    this.callback = callback
    this.emitter = new EventEmitter()
    this.iterations = 0
    this.options = _.defaultsDeep(options, {
      'name': null,
      'description': null,
      'wait': null, // Should run after x ms array will randomize
      'every': null, // Should run every x ms array will randomize
      'limit': null, // If interval was set, how many time should we execute
      'timeout': 10000 // After what amound of seconds should the task become unresponsive
    })

    logger.info(`Initializing task: "${this.options.name}"`)
  }

  execute () {
    this.promise = new Promise((resolve, reject) => {
      // Call the callback and store the promise
      this._wait()
        .then(this._call.bind(this))
        .catch(reject)
        .then(resolve)
        .then(this._repeatUntil.bind(this))
        .catch(reject)
    })
  }

  _wait () {
    const { wait } = this.options

    const promise = new Promise((resolve) => {
      // Handle the case where we do not wait
      if (typeof wait !== 'number' || wait <= 0) {
        return resolve()
      }

      // Wait
      setTimeout(() => {
        return resolve()
      }, wait)
    })

    return promise
  }

  _repeatUntil () {
    const { every, limit } = this.options

    if (typeof every !== 'number' || every <= 0) {
      return
    }

    if ((typeof limit !== 'number' || typeof limit === 'number') && this.iterations >= limit) {
      return
    }

    // Recall the function until limit is reached
    return this._call()
    .then(() => {
      return setTimeout(this._repeatUntil, every)
    })
    .catch((err) => {
      logger.error(err.message)
    })
  }

  _call () {
    const { timeout } = this.options

    logger.info(`Calling task: "${this.options.name}"`)

    // Keeping track of the iterations of the task calls
    this.iterations++

    const promise = new Promise((resolve, reject) => {
      this.callback(resolve, reject)

      setTimeout(() => {
        reject(new Error(`Task timed out after ${timeout}`))
      }, timeout)
    })

    promise.then(() => {
      return logger.success(`Task: "${this.options.name}" finished successfuly!`)
    })

    return promise
  }
}
