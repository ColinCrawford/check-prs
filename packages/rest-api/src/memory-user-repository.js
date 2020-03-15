const crypto = require('crypto')

const { userSchema } = require('./user-repository')

function generateApiKey () {
  return crypto.randomBytes(20).toString('hex')
}

module.exports = () => {
  const db = {}

  async function createUser (user) {
    const { error } = userSchema.validate(user)
    if (error) {
      throw error
    }

    user.apiKey = generateApiKey()

    db[user.apiKey] = user
    return user
  }

  async function getUserForToken (apiKey) {
    return db[apiKey]
  }

  return {
    createUser,
    getUserForToken
  }
}
