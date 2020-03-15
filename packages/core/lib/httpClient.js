'use strict'

const https = require('https')
const http = require('http')

const getClient = path => path.startsWith('https') ? https : http

module.exports = () => {
  function get (path, httpOptions = {}) {
    const client = getClient(path)
    return new Promise((resolve, reject) => {
      client.get(path, httpOptions, res => {
        const data = []
        let chunk

        const buildResult = () => {
          res.data = Buffer.concat(data).toString('utf8')
          return res
        }

        res.on('readable', () => {
          while ((chunk = res.read()) !== null) {
            data.push(chunk)
          }
        })

        res.on('end', () => resolve(buildResult()))

        res.on('error', (error) => reject(error))
      })
    })
  }

  function postJSON (path, body, httpOptions = {}) {
    const client = getClient(path)
    const json = JSON.stringify(body)
    const options = {
      path,
      method: 'POST',
      ...httpOptions,
      headers: {
        'content-length': json.length,
        'content-type': 'application/json',
        ...(httpOptions.headers || {})
      }
    }
    return new Promise((resolve, reject) => {
      const req = client.request(options, res => {
        const data = []
        let chunk

        const buildResult = () => {
          res.data = JSON.parse(Buffer.concat(data).toString('utf8'))
          return res
        }

        res.on('readable', () => {
          while ((chunk = res.read()) !== null) {
            data.push(chunk)
          }
        })

        res.on('end', () => resolve(buildResult()))

        res.on('error', (error) => reject(error))
      })

      req.write(json)
      req.end()
    })
  }

  return {
    get,
    postJSON
  }
}
