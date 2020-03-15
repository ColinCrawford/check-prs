'use strict'

const Boom = require('@hapi/boom')
const { userSchema } = require('./user-repository')

function parseAuthorizationHeader (header) {
  if (!header) return
  if (!header.startsWith('Bearer')) return
  return header.split('Bearer ')[1]
}

module.exports = {
  name: 'auth',
  version: '0.0.1',
  register: async function (server, options) {
    const { userRepository } = options

    server.auth.scheme('token', function (server, options) {
      async function authenticate (request, h) {
        const authorizationHeader = request.headers.authorization
        const token = parseAuthorizationHeader(authorizationHeader)

        if (!authorizationHeader || !token) {
          throw Boom.unauthorized()
        }

        const user = await userRepository.getUserForToken(token)
        return h.authenticated({ credentials: { user } })
      }
      return { authenticate }
    })
    server.auth.strategy('default', 'token')
    server.auth.default('default')

    server.route({
      method: 'POST',
      path: '/users',
      options: {
        auth: false,
        validate: {
          payload: userSchema
        }
      },
      handler: async function (request, h) {
        const user = await userRepository.createUser(request.payload)
        return h.response(user).code(201)
      }
    })
  }
}
