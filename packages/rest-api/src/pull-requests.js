'use strict'

module.exports = {
  name: 'pullRequests',
  version: '0.0.1',
  register: async function (server, options) {
    server.route({
      method: 'GET',
      path: '/pull-requests',
      options: {
        auth: {
          mode: 'required'
        }
      },
      handler: async function (request, h) {
        const { githubUsername, githubAccessToken, repos } = request.auth.credentials.user
        const githubClient = options.githubClient({
          username: githubUsername,
          accessToken: githubAccessToken
        })
        const getPRs = ({ name: repo, owner }) => githubClient.getPRs({ repo, owner })
        const prs = await Promise.all(repos.map(getPRs))
        return prs.filter(repoPrs => repoPrs.length).flat()
      }
    })
  }
}
