'use strict'

function getConfig () {
  const { PORT, HOST, APP_ENV } = process.env
  const appEnv = APP_ENV || 'dev'

  return {
    port: PORT || 3000,
    host: HOST || 'localhost',
    appEnv,
    isTest: appEnv === 'test',
    isProd: appEnv === 'production',
    isDev: appEnv === 'dev'
  }
}

module.exports = {
  getConfig
}
