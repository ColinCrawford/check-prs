'use strict'

const { startServer } = require('./server')
const { getConfig } = require('./config.js')

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

startServer(getConfig())
