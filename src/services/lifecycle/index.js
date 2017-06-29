const logger = require('services/logger')
const Promise = require('bluebird')
const Task = require('services/lifecycle/task')

const queues = {
  'init': []
}

const queueTask = (when, hook, task) => {
  if (typeof hook !== 'string' || !queues[hook]) {
    throw new Error('Hook is not valid.')
  }

  if (!(task instanceof Task)) {
    throw new Error('Task is not valid.')
  }

  queues[hook].push({
    task,
    'when': 'before'
  })
}

module.exports = {
  before (hook, task) {
    queueTask('before', hook, task)
  },

  on (hook, task) {
    queueTask('while', hook, task)
  },

  after (hook, task) {
    queueTask('after', hook, task)
  },

  register (hook, promise) {
    const before = []
    const after = []
    const during = []

    // Execute all the tasks before and while
    queues[hook].map(({ task, when }) => {
      if (when === 'after') {
        return null
      }

      task.execute()

      // Push in before queue
      if (when === 'before') {
        return before.push(task.promise)
      }

      // Default to storing in the during array
      return during.push(task.promise)
    })

    // After
    if (typeof promise !== 'undefined') {
      promise.then(() => {
        return queues[hook].map(({ task, when }) => {
          if (when !== 'after') {
            task.execute()
          }

          return after.push(task.promise)
        })
      })
      .catch((error) => {
        logger.error(error.message)
      })
    }

    // Before
    return new Promise((resolve, reject) => {
      // This makes sure the before tasks are executed
      Promise.all(before)
      .then(() => {
        return resolve()
      })
      .catch(reject)

      setTimeout(() => {
        reject(new Error(`Task timed out after ${30000}`))
      }, 30000)
    })
  },

  Task
}
