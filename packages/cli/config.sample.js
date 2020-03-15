module.exports = {
  checkPRsAPIPath: 'http://localhost',
  checkPRsAPIPort: 3000,
  // time in milliseconds, falsy value (like 0) won't poll
  pollInterval: 5000,
  user: {
    githubUsername: 'your-username',
    githubAccessToken: 'your-token',
    repos: [
      { owner: 'repo-owner', name: 'repo-name' }
    ]
  }
}
