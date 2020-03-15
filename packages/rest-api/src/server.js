'use strict'

const Hapi = require('@hapi/hapi')
const { githubClient } = require('@check-prs/core')

const userRepository = require('./memory-user-repository')()

async function startServer ({ host, port }) {
  const server = Hapi.server({ host, port })

  await server.register([{
    plugin: require('./auth'),
    options: { userRepository }
  }, {
    plugin: require('./pull-requests'),
    options: { githubClient }
  }, {
    plugin: require('blipp')
  }, {
    plugin: require('laabr')
  }])

  await server.start()
  server.log(['info'], `Server started on port ${port}`)
}

module.exports = {
  startServer
}
