'use strict'

const os = require('os')
const { spawn } = require('child_process')

const Platforms = {
  Mac: Symbol('Mac'),
  Windows: Symbol('Windows'),
  Linux: Symbol('Linux'),
  Other: Symbol('Other')
}

module.exports = () => {
  function getPlatform () {
    switch (os.platform()) {
      case 'linux':
        return Platforms.Linux
      case 'darwin':
        return Platforms.Mac
      case 'win32':
        return Platforms.Windows
      default:
        return Platforms.Other
    }
  }

  function sendLinuxDesktopNotification ({ title, message }) {
    spawn('notify-send', [title, message])
  }

  const Notifiers = {
    [Platforms.Linux]: sendLinuxDesktopNotification
  }

  function sendDesktopNotification ({ title, message }) {
    const notifier = Notifiers[getPlatform()]
    if (!notifier) return

    notifier({ title, message })
  }

  return {
    sendDesktopNotification
  }
}
