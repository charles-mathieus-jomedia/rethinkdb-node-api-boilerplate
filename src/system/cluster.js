const _ = require('lodash')
const cluster = require('cluster')
const { cpus } = require('os')
const environment = require('services/environment')
const EventEmitter = require('event-emitter')
const Promise = require('bluebird')

module.exports = class Cluster {
  constructor () {
    this.emitter = new EventEmitter()
    this._workers = []
    this.crashesCount = 0
    this.crashesLimit = environment.get('MAX_TRIES', 10)
  }

  init () {
    this.emitter.emit('clusterInit')

    return this._fork()
  }

  get processes () {
    return this._workers
  }

  get workerCount () {
    return this._calcWorkerCount()
  }

  _bindForkEvents (worker) {
    worker.on('disconnect', () => {
      this.emitter.emit('workerDisconnect', { worker })
    })

    worker.on('error', (error) => {
      this.emitter.emit('workerError', {
        error,
        worker
      })
    })

    worker.on('exit', (code, signal) => {
      this.emitter.emit('workerExit', {
        code,
        signal,
        worker
      })

      // Prevent diying loop of clusters
      if (worker.exitedAfterDisconnect === true) {
        return
      }

      // Try to reboot app if we are under crash limit
      if (this.crashesCount < this.crashesLimit) {
        // Increase the crash count
        this.crashesCount++

        // Emitting a fork again
        this.emitter.emit('fork')

        // Try again
        cluster.fork()
      }

      this.emitter.emit('clusterExit')

      // kill the cluster, let supervisor restart it
      throw new Error('Too many worker died')
    })

    worker.on('listening', (address) => {
      this.emitter.emit('workerListening', {
        address,
        worker
      })
    })

    worker.on('online', () => {
      this.emitter.emit('workerOnline', {
        worker
      })
    })

    worker.on('message', (message) => {
      this.emitter.emit('workerMessage', {
        message,
        worker
      })
    })
  }

  _calcWorkerCount () {
    // Count the machine's CPUs
    const cpuCount = cpus().length

    const confWorkerCount = environment.get('WEB_CONCURRENCY')

    // Stores the number of workers
    let workerCount = 1

    // Figure out how many workers we should have in total
    if (confWorkerCount === 'auto') {
      workerCount = cpuCount
    } else if (_.isNumber(confWorkerCount)) {
      if (confWorkerCount > cpuCount) {
        throw new Error('Worker count cannot be higher than the number of cpu cores')
      }

      if (confWorkerCount <= 0) {
        throw new Error('Worker count has to be bigger than 0')
      }

      workerCount = confWorkerCount
    }

    return workerCount
  }

  _fork () {
    const clusterPromises = []

    // Create a worker for each CPU
    for (let i = 0; i < this.workerCount; i++) {
      clusterPromises.push(new Promise((resolve) => {
        // Fork a new process
        const worker = cluster.fork()

        // Store the processes in the object
        this._workers.push(worker)

        // Bind some events for the workers
        this._bindForkEvents(worker)

        // Emit an event for when a fork is created
        this.emitter.emit('clusterFork')

        // Resolve Promise
        worker.on('listening', () => {
          resolve()
        })
      }))
    }

    // When all the workers are done listening
    return Promise.all(clusterPromises).then(() => {
      return setTimeout(() => {
        this.emitter.emit('clusterReady')
      }, 0)
    })
  }
}

