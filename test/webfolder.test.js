/* eslint-disable id-length, no-sync */
const http = require('http')
const test = require('tape')
const once = require('lodash.once')
const plugin = require('..')

const webfolderSource = plugin.handler
const baseUrl = 'http://127.0.0.1:43871/'
const readStream = (stream, callback) => {
  const chunks = []
  const src = webfolderSource({baseUrl})
  const cb = once(callback)
  stream
    .on('data', d => chunks.push(d))
    .on('error', err => cb(src.processStreamError(err)))
    .on('end', () => cb(null, Buffer.concat(chunks)))
}

test('has plugin props', t => {
  ['name', 'type', 'handler'].forEach(prop => {
    t.ok(plugin[prop])
  })
  t.end()
})

test('exposes source plugin props', t => {
  const src = webfolderSource({baseUrl})
  t.equal(typeof src.getImageStream, 'function', 'exposes `getImageStream()`')
  t.equal(typeof src.requiresSignedUrls, 'boolean', 'exposes `requiresSignedUrls`')
  t.equal(typeof src.processStreamError, 'function', 'exposes `processStreamError()`')
  t.end()
})

test('does not require signed urls by default', t => {
  t.notOk(webfolderSource({baseUrl}).requiresSignedUrls)
  t.end()
})

test('throws on missing `baseUrl`', t => {
  t.throws(() => webfolderSource({}), /baseUrl/)
  t.end()
})

test('throws on non-http/https url', t => {
  t.throws(() => webfolderSource({baseUrl: 'ftp://bar.baz/image.png'}), /http\/https/i)
  t.end()
})

test('should 404 if dotting out of base url', t => {
  webfolderSource({baseUrl: 'http://localhost/foo'}).getImageStream('../../../foo.png', err => {
    t.ok(err, 'should error')
    t.is(err.output.statusCode, 404, 'should 404')
    t.end()
  })
})

test('provides bad gateway for remote 500s', t => {
  const srv = http.createServer((req, res) => {
    res.writeHead(500, {'Content-Type': 'text/plain'})
    res.end('Internal Server Error')
  })

  const onStreamResponse = (err, stream) => {
    t.ifError(err, 'should not error')
    readStream(stream, readErr => {
      t.ok(readErr instanceof Error, 'should error')
      t.equal(readErr.output.statusCode, 502, 'should give bad gateway on 5xx')
      srv.close(t.end)
    })
  }

  const streamImage = () => {
    webfolderSource({baseUrl, allowPrivateHosts: true})
      .getImageStream('image.png', onStreamResponse)
  }

  srv.listen(43871, streamImage)
})

test('provides passes on remote error for 4xx', t => {
  const srv = http.createServer((req, res) => {
    res.writeHead(401, {'Content-Type': 'text/plain'})
    res.end('Bad Request - Missing some kind of parameter')
  })

  const onStreamResponse = (err, stream) => {
    t.ifError(err, 'should not error')
    readStream(stream, readErr => {
      t.ok(readErr instanceof Error, 'should error')
      t.equal(readErr.output.statusCode, 401, 'should pass on 401')
      srv.close(t.end)
    })
  }

  const streamImage = () => {
    webfolderSource({baseUrl, allowPrivateHosts: true}).getImageStream('image.png', onStreamResponse)
  }

  srv.listen(43871, streamImage)
})
