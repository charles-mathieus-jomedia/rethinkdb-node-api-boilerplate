const lifecycle = require('services/lifecycle')

module.exports = () => {
  const task = new lifecycle.Task((resolve) => {
    // The task
    setTimeout(() => {
      resolve()
    }, 2000)
  }, {
    'name': 'Translation',
    'description': 'Create a generated translation files',
    'wait': null, // Should run after x ms array will randomize
    'every': null, // Should run every x ms array will randomize
    'limit': null, // If interval was set, how many time should we execute
    'timeout': 10000 // After what amound of seconds should the task become unresponsive
  })

  // Queue a task
  lifecycle.before('init', task)

  return task
}
