'use strict'

const PRStatuses = {
  New: Symbol('New'),
  Updated: Symbol('Updated'),
  Unchanged: Symbol('Unchanged')
}

// Very simple word pluralizer
function pluralize (word, count) {
  if (count === 1) return word
  return `${word}s`
}

// Enum representing the possible statuses of a PR
// after polling the Github API
function getPRStatus ({ seenPRs, pr }) {
  const existingPR = seenPRs && seenPRs.get(pr.url)
  if (!existingPR) {
    return PRStatuses.New
  }
  if (existingPR.updated_at === pr.updated_at) {
    return PRStatuses.Unchanged
  }
  return PRStatuses.Updated
}

function groupPRsByStatus ({ prs, seenPRs }) {
  return prs.reduce((acc, pr) => {
    const status = getPRStatus({ seenPRs, pr })
    const prsOfStatus = acc.get(status)
    acc.set(status, [...prsOfStatus, pr])
    return acc
  }, new Map(Object.values(PRStatuses).map(status => [status, []])))
}

module.exports = ({ notifier }) => {
  // Run when the app starts - just gives a list of open PRs
  function sendOpeningPRNotification ({ prs, seenPRs }) {
    const title = `You Have ${prs.length} Open Pull ${pluralize('Request', prs.length)}`
    const message = prs.map(({ url }) => url).join('\n')

    notifier({ title, message })
  }

  // Run after polling the Github api to inform the user of any
  // new or updated PRs
  function sendPollPRNotification ({ prs, seenPRs }) {
    const prsByStatus = groupPRsByStatus({ seenPRs, prs })
    const newPrs = prsByStatus.get(PRStatuses.New)
    const updatedPrs = prsByStatus.get(PRStatuses.Updated)
    const numNew = newPrs.length
    const numUpdated = updatedPrs.length

    if (!numNew && !numUpdated) return

    let title = 'You Have'
    if (numNew) title += ` ${numNew} New Pull ${pluralize('Request', numNew)}`
    if (numNew && numUpdated) title += ' And'
    if (numUpdated) title += ` ${numUpdated} Updated Pull ${pluralize('Request', numUpdated)}`

    const newOrUpdatedPRs = [
      ...newPrs.map(pr => ({ status: PRStatuses.New, pr })),
      ...updatedPrs.map(pr => ({ status: PRStatuses.Updated, pr }))
    ]

    const message = newOrUpdatedPRs
      .map(({ status, pr }) => `${status.description} - ${pr.url}`)
      .join('\n')

    notifier({ title, message })
  }

  // determine which notification to send the user based on whether this
  // is the first request to the github API
  function sendPRStatusNotification ({ seenPRs, prs }) {
    if (!seenPRs) sendOpeningPRNotification({ seenPRs, prs })
    else sendPollPRNotification({ seenPRs, prs })
  }

  return {
    sendPRStatusNotification
  }
}
