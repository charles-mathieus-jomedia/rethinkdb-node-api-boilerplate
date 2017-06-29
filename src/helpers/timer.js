class Timer {
  constructor () {
    this.startTime = new Date()
  }

  start () {
    this.startTime = new Date()
  }

  stop () {
    const { time } = this

    this.start()

    return time
  }

  get time () {
    return this._calcTime()
  }

  _calcTime () {
    return (new Date() - this.startTime) / 1000
  }
}

module.exports = Timer
