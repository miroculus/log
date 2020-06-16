const Sentry = require('@sentry/node')
const log = require('@miroculus/log')

const { SENTRY_URL, BUILD_NUMBER } = process.env

if (SENTRY_URL) {
  Sentry.init({
    dsn: SENTRY_URL,
    release: BUILD_NUMBER
  })

  log.on('log', ({ level, args }) => {
    switch (level) {
      case 'critical': {
        const [err] = args
        Sentry.withScope((scope) => {
          scope.setLevel('fatal')
          Sentry.captureException(err)
        })
        break
      }
      case 'error': {
        const [err] = args
        Sentry.captureException(err)
        break
      }
      case 'warn': {
        const [msg, data] = args

        // log.warn allows you to post extra data to be sended to sentry
        const extra = typeof data === 'string' || typeof data === 'number'
          ? { data }
          : data

        Sentry.withScope((scope) => {
          scope.setLevel('warning')
          if (data !== undefined) scope.setExtra('data', extra)
          Sentry.captureMessage(msg)
        })
        break
      }
    }
  })
}
