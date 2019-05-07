const Sentry = require('@sentry/node')
const log = require('@miroculus/log')

const { SENTRY_URL, BUILD_NUMBER } = process.env

if (SENTRY_URL) {
  Sentry.init({
    dsn: SENTRY_URL,
    release: BUILD_NUMBER
  })

  log.on('log:critical', (err) => {
    Sentry.withScope((scope) => {
      scope.setLevel('fatal')
      Sentry.captureException(err)
    })
  })

  log.on('log:error', (err) => {
    Sentry.captureException(err)
  })

  log.on('log:warn', (msg, data) => {
    // log.warn allows you to post extra data to be sended to sentry
    const extra = typeof data === 'string' || typeof data === 'number'
      ? { data }
      : data

    Sentry.withScope((scope) => {
      scope.setLevel('warning')
      if (data !== undefined) scope.setExtra('data', extra)
      Sentry.captureMessage(msg)
    })
  })
}
