const assert = require('assert')
const { describe, it, beforeEach } = require('mocha')
const log = require('..')

const expectEmit = (target, eventName) => new Promise((resolve) => {
  target.once(eventName, (...args) => resolve(args))
})

const expectCall = (obj, fnName) => new Promise((resolve) => {
  const original = obj[fnName]
  obj[fnName] = (...args) => {
    obj[fnName] = original
    resolve(args)
  }
})

const throwOnCall = (obj, fnName) => new Promise((resolve, reject) => {
  const original = obj[fnName]
  obj[fnName] = () => {
    obj[fnName] = original
    reject(new Error(`The function ${fnName} shouldn't have been called`))
  }
  setTimeout(() => {
    obj[fnName] = original
    resolve(true)
  })
})

describe('@miroculus/log', () => {
  beforeEach(() => {
    log.setLevel('debug')
  })

  describe('logging callbacks', () => {
    log.LEVELS.forEach((level) => {
      it(`should execute log functions of level "${level}"`, async () => {
        const msg = `some message with level ${level}`
        const expectations = Promise.all([
          expectCall(log.defaultLoggers, level),
          expectEmit(log, `log:${level}`)
        ])

        log[level](msg)

        const [logged, emitted] = await expectations

        assert.deepStrictEqual(logged, [null, msg])
        assert.deepStrictEqual(emitted, [msg])
      })
    })
  })

  describe('scope configuration', () => {
    it('should call default logger with scope', async () => {
      const msg = 'some message'
      const scope = 'some-scope'
      const scopedLog = log.createLog(scope)
      const expectation = expectCall(log.defaultLoggers, 'info')

      scopedLog.info(msg)

      const result = await expectation

      assert.deepStrictEqual(result, [scope, msg])
    })
  })

  describe('level configuration', () => {
    it('should correctly change the logging level', async () => {
      log.setLevel('warn')

      assert.strictEqual(log.critical.enabled(), true)
      assert.strictEqual(log.error.enabled(), true)
      assert.strictEqual(log.warn.enabled(), true)
      assert.strictEqual(log.info.enabled(), false)
      assert.strictEqual(log.debug.enabled(), false)

      const expectations = Promise.all([
        expectCall(log.defaultLoggers, 'critical'),
        expectCall(log.defaultLoggers, 'error'),
        expectCall(log.defaultLoggers, 'warn'),
        throwOnCall(log.defaultLoggers, 'info'),
        throwOnCall(log.defaultLoggers, 'debug')
      ])

      log.critical('some critical message')
      log.error('some error message')
      log.warn('some warn message')
      log.info('some info message')
      log.debug('some debug message')

      const [
        criticalResult,
        errorResult,
        warnResult,
        infoResult,
        debugResult
      ] = await expectations

      assert.deepStrictEqual(criticalResult, [null, 'some critical message'])
      assert.deepStrictEqual(errorResult, [null, 'some error message'])
      assert.deepStrictEqual(warnResult, [null, 'some warn message'])
      assert.ok(infoResult)
      assert.ok(debugResult)
    })
  })
})
