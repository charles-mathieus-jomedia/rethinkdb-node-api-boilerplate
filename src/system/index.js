const cluster = require('cluster')
const master = require('system/master')
const worker = require('system/worker')

// Include the right files depending if it's worker or master
if (cluster.isMaster) {
  // Only Master process will go in here
  master()
} else {
  // Only Worker processes will go in here
  worker()
}
