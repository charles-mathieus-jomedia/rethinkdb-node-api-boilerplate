const colors = require('colors')
const config = require('services/config')
const environment = require('services/environment')
const fsx = require('fs-extra')
const path = require('path')
const Promise = require('bluebird')
const winston = require('winston')

const fs = Promise.promisifyAll(fsx)

const n = (nu) => {
  if (nu > 9) {
    return nu
  }

  return `0${nu}`
}

const transports = []

if (environment.isDebug()) {
  transports.push(new winston.transports.Console({
    'level': 'debug',
    'timestamp': () => {
      return Date.now()
    },
    'formatter': (options) => {
      const timestamp = options.timestamp()
      const date = new Date(timestamp)
      const hour = n(date.getHours())
      const minute = n(date.getMinutes())
      const second = n(date.getSeconds())
      const prefix = `${colors.yellow(`${hour}:${minute}:${second}`)} :`
      const { level } = options
      let msg = ''
      let meta = ''

      if (level === 'response') {
        if (options.meta && options.meta.status &&
            options.meta.method && options.meta.responseTime &&
            options.meta.url) {
          const status = parseInt(options.meta.status, 10)
          const m = colors.cyan(options.meta.method)
          const u = options.meta.url
          const r = colors.grey(`${options.meta.responseTime}ms`)
          let s = colors.green(status)

          if (status >= 200 && status < 400) {
            s = colors.green(status)
          } else if (status >= 400 && status < 500) {
            s = colors.yellow(status)
          } else {
            s = colors.red(status)
          }

          msg = `[${m}][${s}] -> ${u} ${r}`
        }
      } else {
        if (typeof options.message !== 'undefined') {
          msg = options.message
        }
        if (options.meta && Object.keys(options.meta).length) {
          meta = `\n${JSON.stringify(options.meta, null, 2)}`
        }
      }

      if (level === 'error') {
        msg = colors.red(msg)
      }

      if (level === 'warn') {
        msg = colors.yellow(msg)
      }

      if (level === 'success') {
        msg = colors.green(msg)
      }

      if (level === 'debug') {
        msg = colors.magenta(msg)
      }

      // Return string will be passed to logger.
      if (msg !== '' || meta !== '') {
        return `${prefix} ${msg} ${meta}`
      }
    }
  }))
} else {
  // Build log destination
  const logFile = 'stdout.log'
  const logDir = config.get('server.logDir')

  if (typeof logDir !== 'string') {
    throw new Error(`Log directory (server.logDir from config) must be a string. Currently ${typeof logDir}`)
  }

  const logDest = path.join(logDir, logFile)

  // Make sure log folder exists
  fs.mkdirpAsync(logDir).then(() => {
    // Output to a file
    transports.push(new winston.transports.File({
      'filename': logDest
    }))
  })
}

const logger = new winston.Logger({
  'levels': {
    'error': 0,
    'warn': 1,
    'info': 2,
    'success': 3,
    'request': 3,
    'response': 3,
    'debug': 3,
    'silly': 4
  },
  transports
})

module.exports = logger
