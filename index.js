const EventEmitter = require('events')

const hasOwnProperty = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key)

const prefix = (level = 'DEBUG', scope = null) =>
  `[${level}]${scope ? `[${scope}]` : ''}`

const LEVELS = [
  'critical',
  'error',
  'warn',
  'info',
  'debug'
]

Object.freeze(LEVELS)

const defaultLoggers = {
  critical: (scope, ...args) => console.error(prefix('CRITICAL', scope), ...args),
  error: (scope, ...args) => console.error(prefix('ERROR', scope), ...args),
  warn: (scope, ...args) => console.warn(prefix('WARN', scope), ...args),
  info: (scope, ...args) => console.log(prefix('INFO', scope), ...args),
  debug: (scope, ...args) => console.log(prefix('DEBUG', scope), ...args)
}

const states = LEVELS.reduce((s, level) => {
  s[level] = false
  return s
}, {})

const setLevel = (logLevel) => {
  if (!hasOwnProperty(states, logLevel)) {
    throw new Error(`Invalid LOG_LEVEL ${logLevel}.`)
  }

  // From which level we will log to the console?
  const logLevelIndex = LEVELS.findIndex((level) => logLevel === level)

  LEVELS.forEach((level, index) => {
    states[level] = index <= logLevelIndex
  })
}

const createLog = (scope = null) => {
  const log = new EventEmitter()

  log.createLog = createLog
  log.setLevel = setLevel
  log.defaultLoggers = defaultLoggers
  log.LEVELS = LEVELS

  // Initialize logger fns, log.info, log.error, etc
  LEVELS.forEach((level) => {
    // Log levels cannot be the same as native props
    if (hasOwnProperty(log, level)) throw new Error(`Invalid log level "${level}"`)

    log[level] = (...args) => {
      if (states[level]) {
        defaultLoggers[level](scope, ...args)
        baseLogger.emit(`log:${level}`, ...args)
      }
    }

    log[level].enabled = () => states[level]
  })

  return log
}

const baseLogger = createLog()

module.exports = baseLogger
