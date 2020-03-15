const Joi = require('@hapi/joi')

const repoSchema = Joi.object({
  name: Joi.string().required(),
  owner: Joi.string().required()
})

const userSchema = Joi.object({
  githubUsername: Joi.string().required(),
  githubAccessToken: Joi.string().required(),
  repos: Joi.array().items(repoSchema)
})

module.exports = {
  userSchema,
  repoSchema
}
