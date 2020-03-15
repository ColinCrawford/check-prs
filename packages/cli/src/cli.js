'use strict'

const core = require('@check-prs/core')
const { user, pollInterval, checkPRsAPIPath, checkPRsAPIPort } = require('../config')
const { sendDesktopNotification } = require('./notifications')()
const { sendPRStatusNotification } = require('./poller')({ notifier: sendDesktopNotification })

const dateOptions = {
  timeZone: 'America/New_York'
}

function printPR (pr) {
  console.table({
    repo: pr.base.repo.name,
    title: pr.title,
    body: pr.body,
    openedBy: pr.user.login,
    createdAt: Date(pr.created_at).toLocaleString('en-US', dateOptions),
    updatedAt: Date(pr.updated_at).toLocaleString('en-US', dateOptions),
    url: pr.url
  })
}

function displayPRs (prs) {
  console.clear()
  prs.forEach(printPR)
}

const httpClient = core.httpClient()

// Get open Github Pull Requests given the user's config
async function getOpenPRs (apiKey) {
  const resp = await httpClient.get(
      `${checkPRsAPIPath}/pull-requests`,
      { port: checkPRsAPIPort, headers: { authorization: `Bearer ${apiKey}` } }
  )
  return JSON.parse(resp.data)
}

async function main () {
  const resp = (await httpClient.postJSON(
    `${checkPRsAPIPath}/users`,
    user,
    { port: checkPRsAPIPort }
  )).data
  if (resp.error) {
    throw new Error(resp.message)
  }
  const apiKey = resp.apiKey
  console.log('got api key ', apiKey)
  // track which repos we've seen so far to determine
  // when new PRs are issued or existing PRs are updated
  let seenPRs

  function updateSeenPRs (prs) {
    seenPRs = new Map(prs.map((pr) => [pr.url, pr]))
  }

  async function tick () {
    const prs = await getOpenPRs(apiKey)

    sendPRStatusNotification({ seenPRs, prs })
    updateSeenPRs(prs)
    displayPRs(prs)

    pollInterval && setTimeout(tick, pollInterval)
  }

  tick()
}

main()
