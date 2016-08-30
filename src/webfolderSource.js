const url = require('url')
const Boom = require('boom')
const proxySource = require('mead-plugin-source-proxy')
const httpPattern = /^https?:\/\//i

function webfolderSource(config) {
  if (!config.baseUrl) {
    throw new Error('Webfolder sources require a `baseUrl`-property')
  }

  if (!httpPattern.test(config.baseUrl)) {
    throw new Error('Webfolder source `baseUrl`-property must be an HTTP/HTTPS url')
  }

  const baseUrl = `${config.baseUrl}/`.replace(/\/+$/, '/')
  const parsedBaseUrl = url.parse(baseUrl)
  const proxy = proxySource.handler({
    // Since the user is specifying the base URL himself, allow private hosts
    allowPrivateHosts: true,
    allowRequest: config.allowRequest,
    timeout: config.timeout,
    retries: config.retries,
    secureUrlToken: 'unused'
  })

  return {
    getImageStream,
    processStreamError: proxy.processStreamError,
    requiresSignedUrls: false
  }

  function getImageStream(urlPath, callback) {
    const imageUrl = url.format(Object.assign({}, parsedBaseUrl, {
      pathname: url.resolve(parsedBaseUrl.pathname, urlPath)
    }))

    if (imageUrl.indexOf(`${baseUrl}`) !== 0) {
      callback(Boom.notFound('Image not found'))
      return
    }

    proxy.getImageStream(imageUrl, callback)
  }
}

module.exports = {
  name: 'webfolder',
  type: 'source',
  handler: webfolderSource
}
