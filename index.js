
const EventEmitter = require('events')

// Pretty print the date, e.g.: "2019-3-13 18:41:02 -7"
const now = () => {
  const date = new Date()
  const time = date.toLocaleString()
  const gmt = date.getTimezoneOffset() / 60
  return `${time} ${gmt >= 0 ? '-' : '+'}${gmt}`
}

const prefix = (level = 'DEBUG', prefix = null) =>
  `[${level}][${now()}]${prefix ? `[${prefix}]` : ''}`

const levels = [
  'critical',
  'error',
  'warn',
  'info',
  'debug'
]

// Define log levels and default handlers, which will show them on the console
// if enabled using LOG_LEVEL
const loggers = [
  { level: 'critical', fn: (...args) => console.error(prefix('CRITICAL'), ...args) },
  { level: 'error', fn: (...args) => console.error(prefix('ERROR'), ...args) },
  { level: 'warn', fn: (...args) => console.warn(prefix('WARN'), ...args) },
  { level: 'info', fn: (...args) => console.log(prefix('INFO'), ...args) },
  { level: 'debug', fn: (...args) => console.log(prefix('DEBUG'), ...args) }
]

// From which level we will log to the console?
const logLevelIndex = loggers.findIndex(({ level }) => logLevel === level)
if (logLevelIndex === -1) throw new Error(`Invalid LOG_LEVEL ${logLevel}.`)

// Initialize logger fns, log.info, log.error, etc
loggers.forEach(({ level, fn }, index) => {
  const enabled = index <= logLevelIndex

  // Log levels cannot be the same as native props
  if (log.hasOwnProperty(level)) throw new Error(`Invalid log level "${level}"`)

  log[level] = (...args) => {
    if (enabled) fn(...args)
    log.emit(`log:${level}`, ...args)
  }

  log[level].enabled = enabled
})

module.exports = log
