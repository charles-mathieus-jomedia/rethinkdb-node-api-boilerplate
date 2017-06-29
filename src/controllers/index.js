const express = require('express')
const initController = require('controllers/init')

// eslint-disable-next-line new-cap
const router = express.Router()

router.use(initController)

module.exports = router
