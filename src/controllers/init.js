const app = require('system/app')
const config = require('services/config')
const environment = require('services/environment')
const express = require('express')
const helmet = require('helmet')
const logger = require('services/logger')
const morgan = require('morgan')
const path = require('path')

// eslint-disable-next-line new-cap
const router = express.Router()

// Basic security middleware that helps you secure your Express apps by
// setting various HTTP headers
router.use(helmet())

// This part is simply to log all the requests & response stuff in the console,
// it can be quite useful to see what is going on. Only active in debug mode
if (environment.isDebug()) {
  router.use(morgan((tokens, req, res) => {
    const method = tokens.method(req, res)
    const url = tokens.url(req, res)
    const status = tokens.status(req, res)
    const contentLength = tokens.res(req, res, 'content-length')
    const responseTime = tokens['response-time'](req, res)

    logger.response({
      method,
      url,
      status,
      contentLength,
      responseTime
    })
  }))
}

module.exports = router
