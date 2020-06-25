/* eslint-env jest */

const log = require('.')

describe('@miroculus/log', function () {
  let consoleSpy
  let logMock

  beforeAll(() => {
    consoleSpy = {
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      debug: jest.spyOn(console, 'debug').mockImplementation(() => {})
    }

    logMock = jest.fn()

    log.on('log', logMock)
  })

  beforeEach(() => {
    log.setLevel('debug')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('log', () => {
    test.each([
      ['critical', 'error'],
      ['error', 'error'],
      ['warn', 'warn'],
      ['info', 'log'],
      ['debug', 'debug']
    ])('.%s()', function (level, consoleFn) {
      const msg = `some message with level ${level}`

      log[level](msg)

      expect(logMock).toHaveBeenCalledTimes(1)
      expect(logMock).toHaveBeenCalledWith({ level, args: [msg], scopes: [] })
      expect(consoleSpy[consoleFn]).toHaveBeenCalledTimes(1)
      expect(consoleSpy[consoleFn]).toHaveBeenCalledWith(`[${level.toUpperCase()}]`, msg)
    })

    test('single scope', () => {
      const msg = 'some scoped log'
      const scopes = ['the-scope']
      const scopedLog = log.createLog(...scopes)

      scopedLog.info(msg)

      expect(logMock).toHaveBeenCalledTimes(1)
      expect(logMock).toHaveBeenCalledWith({ level: 'info', args: [msg], scopes })
      expect(consoleSpy.log).toHaveBeenCalledTimes(1)
      expect(consoleSpy.log).toHaveBeenCalledWith(`[INFO][${scopes[0]}]`, msg)
    })

    test('multi scope', () => {
      const msg = 'some scoped log'
      const scopes = ['first', 'second']
      const scopedLog = log.createLog(...scopes)

      scopedLog.info(msg)

      expect(logMock).toHaveBeenCalledTimes(1)
      expect(logMock).toHaveBeenCalledWith({ level: 'info', args: [msg], scopes })
      expect(consoleSpy.log).toHaveBeenCalledTimes(1)
      expect(consoleSpy.log).toHaveBeenCalledWith(`[INFO][${scopes[0]}][${scopes[1]}]`, msg)
    })
  })

  describe('.setLevel()', () => {
    test('should only log warns and up', function () {
      log.setLevel('warn')

      ;[
        ['critical', true],
        ['error', true],
        ['warn', true],
        ['info', false],
        ['debug', false]
      ].forEach(([level, shouldCall]) => {
        const msg = `some msg with level "${level}"`
        log[level](msg)

        expect(logMock).toHaveBeenCalledTimes(shouldCall ? 1 : 0)

        if (shouldCall) {
          expect(logMock).toHaveBeenCalledWith({ level, args: [msg], scopes: [] })
        }

        logMock.mockClear()
      })
    })
  })
})
