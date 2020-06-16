const EventEmitter = require('events')

/**
 * @typedef {Object} Log
 * @property {() => void} critical
 * @property {() => void} error
 * @property {() => void} warn
 * @property {() => void} info
 * @property {() => void} debug
 * @property {(scope?: string) => Log} createLog create a new logging function with the given scope
 */

const hasOwnProperty = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key)

const consolePrefix = (level = 'DEBUG', scope = null) =>
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
  critical: ({ scope, args }) => console.error(consolePrefix('CRITICAL', scope), ...args),
  error: ({ scope, args }) => console.error(consolePrefix('ERROR', scope), ...args),
  warn: ({ scope, args }) => console.warn(consolePrefix('WARN', scope), ...args),
  info: ({ scope, args }) => console.log(consolePrefix('INFO', scope), ...args),
  debug: ({ scope, args }) => console.log(consolePrefix('DEBUG', scope), ...args)
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

/**
 * Create an scoped logging function
 * @param {string} scope
 * @returns {Log}
 */
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
        const logObject = { level, args }
        if (scope) logObject.scope = scope
        defaultLoggers[level](logObject)
        baseLogger.emit('log', logObject)
      }
    }

    log[level].enabled = () => states[level]
  })

  return log
}

const baseLogger = createLog()

module.exports = baseLogger
