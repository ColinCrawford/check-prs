'use strict'

const http = require('./httpClient')()

module.exports = ({ httpClient = http, username, accessToken }) => {
  const baseUrl = 'https://api.github.com'

  async function getPRs ({ repo, owner }) {
    const options = {
      headers: { 'user-agent': 'node.js' }
    }
    if (username && accessToken) options.auth = `${username}:${accessToken}`
    const resp = await httpClient.get(`${baseUrl}/repos/${owner}/${repo}/pulls`, options)
    return JSON.parse(resp.data)
  }

  return {
    getPRs
  }
}
