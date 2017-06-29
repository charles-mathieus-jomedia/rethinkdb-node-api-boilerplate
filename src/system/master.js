const tasks = require('tasks')
const _ = require('lodash')
const Cluster = require('system/cluster')
const lifecycle = require('services/lifecycle')
const logger = require('services/logger')
const Timer = require('helpers/timer')

// The little timer utility
const timer = new Timer()

module.exports = () => {
  // Init the tasks
  for (const i in tasks) {
    if (_.isFunction(tasks[i])) {
      tasks[i]()
    }
  }

  // Instanciate the cluster class
  const cluster = new Cluster()

  // Before init hook for tasks
  lifecycle.register('init')
    .then(() => {
      // Init the cluster this will automatically fork the right amount of workers
      return cluster.init()
    })
    .catch((err) => {
      throw err
    })

  cluster.emitter.on('workerListening', ({ worker, address }) => {
    const { id } = worker
    const { pid } = worker.process
    const sec = timer.time

    logger.info(`Worker ${id} with pid: ${pid} listening on port ${address.port} after ${sec}s`)
  })

  cluster.emitter.on('clusterReady', () => {
    const sec = timer.time

    logger.success(`Cluster ready after ${sec}s`)

    if (!_.isFunction(process.send)) {
      return
    }

    process.send({ 'serverListening': true })
  })
}
