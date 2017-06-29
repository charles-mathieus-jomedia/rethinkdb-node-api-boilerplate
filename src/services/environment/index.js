const _ = require('lodash')

module.exports = {
  get (key, defaultValue) {
    // Make sure we the key is a string
    if (!_.isString(key)) {
      throw new Error(`Key is not valid.\nValue: ${key}\nType: ${typeof key}`)
    }

    // Breaks the app in case the environment variable is not defined, to
    // prevent some errors, warning or weird stuff from happening.
    if (_.isUndefined(key) && _.isUndefined(defaultValue)) {
      throw new Error(`Environment variable ${key} must be defined!`)
    }

    return _.get(process.env, key) || defaultValue // eslint-disable-line no-process-env
  },
  has (key) {
    if (!_.isString(key)) {
      throw new Error(`Key is not valid.\nValue: ${key}\nType: ${typeof key}`)
    }

    return !_.isUndefined(_.get(process.env, key)) // eslint-disable-line no-process-env
  },
  isDebug () {
    if (this.has('DEBUG')) {
      return this.get('DEBUG')
    }

    if (this.has('NODE_ENV')) {
      return this.get('NODE_ENV') !== 'production'
    }

    return false
  }
}
