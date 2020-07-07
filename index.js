const { EventEmitter } = require('events')

/**
 * @typedef {('critical'|'error'|'warn'|'info'|'debug')} LogLevel
 */

/**
 * @typedef {Object} LogValue
 * @property {LogLevel} level
 * @property {any[]} args
 * @property {string[]} scopes
 * @property {number} time
 */

/** @constant {LogLevel[]} */
const LEVELS = [
  'critical',
  'error',
  'warn',
  'info',
  'debug'
]

Object.freeze(LEVELS)

// Its verbose for having better type inference.
const states = {
  critical: false,
  error: false,
  warn: false,
  info: false,
  debug: false
}

/**
 * @param {Object} obj
 * @param {string} key
 */
const hasOwnProperty = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key)

class Log extends EventEmitter {
  /**
   * Create a log instance
   * @param {string[]} [scopes]
   */
  constructor (scopes = []) {
    super()
    this.scopes = scopes
    this.LEVELS = LEVELS
    this.Log = Log

    LEVELS.forEach((level) => {
      this[level] = this[level].bind(this)
    })
  }

  /**
   * Create a log instance
   * @param {...string} [scopes]
   * @returns {Log}
   */
  createLog (...scopes) {
    return new Log(scopes)
  }

  /**
   * @param {LogLevel} logLevel
   */
  setLevel (logLevel) {
    if (!hasOwnProperty(states, logLevel)) {
      throw new Error(`Invalid LOG_LEVEL ${logLevel}.`)
    }

    // From which level we will log to the console?
    const logLevelIndex = LEVELS.findIndex((level) => logLevel === level)

    /**
     * @param {LogLevel} level
     * @param {number} index
     */
    const updateLogLevel = (level, index) => {
      states[level] = index <= logLevelIndex
    }

    LEVELS.forEach(updateLogLevel)
  }

  /**
   * Check if the given log level is enabled
   * @param {LogLevel} logLevel
   * @returns {boolean}
   */
  enabled (logLevel) {
    return states[logLevel]
  }

  /**
   * @param {('log')} evtName
   * @param {(logValue: LogValue) => void} cb
   */
  on (evtName, cb) {
    return super.on(evtName, cb)
  }

  /**
   * @private
   * @param {LogLevel} level
   * @param {...any} args
   */
  _log (level, ...args) {
    if (!states[level]) return

    /** @type {LogValue} */
    const logValue = {
      level,
      args,
      scopes: [...this.scopes],
      time: Date.now()
    }

    baseLogger.emit('log', logValue)
  }

  /**
   * @param {...any} args
   */
  critical (...args) {
    return this._log('critical', ...args)
  }

  /**
   * @param {...any} args
   */
  error (...args) {
    return this._log('error', ...args)
  }

  /**
   * @param {...any} args
   */
  warn (...args) {
    return this._log('warn', ...args)
  }

  /**
   * @param {...any} args
   */
  info (...args) {
    return this._log('info', ...args)
  }

  /**
   * @param {...any} args
   */
  debug (...args) {
    return this._log('debug', ...args)
  }
}

const baseLogger = new Log()

const consoleFnMap = {
  critical: 'error',
  error: 'error',
  warn: 'warn',
  info: 'log',
  debug: 'debug'
}

function consoleLogger ({ level, scopes, args }) {
  const scope = scopes.length > 0 ? `[${scopes.join('][')}]` : ''
  const prefix = `[${level.toUpperCase()}]${scope}`
  console[consoleFnMap[level]](prefix, ...args)
}

baseLogger.on('log', consoleLogger)

baseLogger.disableDefaultConsoleLogger = () => {
  baseLogger.removeListener('log', consoleLogger)
}

module.exports = baseLogger
