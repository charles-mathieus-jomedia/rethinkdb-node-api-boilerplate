const _ = require('lodash')
const config = require('configs')

module.exports = {
  get (key, defaultValue) {
    if (!_.isString(key)) {
      throw new Error(`Key is not valid.\nValue: ${key}\nType: ${typeof key}`)
    }

    return _.get(config, key) || defaultValue
  },
  has (key) {
    if (!_.isString(key)) {
      throw new Error(`Key is not valid.\nValue: ${key}\nType: ${typeof key}`)
    }

    return !_.isUndefined(_.get(config, key))
  }
}
