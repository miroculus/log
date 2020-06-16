# @miroculus/log

Simple logging library for Node.js intended to be used internally at
[Miroculus](https://miroculus.com/).

## Installation

```
npm i @miroculus/log
```

## Getting Started

By default, the library will log everything to the console, including the log
level and a timestamp:

```javascript
const log = require('@miroculus/log')

log.info('some message')
// [INFO] some message
```

## Logging Levels

The library includes the following logging levels:

1. `critical`
2. `error`
3. `warn`
4. `info`
5. `debug`

And you can enable them using the function `setLevel`, that receives the logging
level you which to enable, and will disable all the levels it has underneath.

e.g.:

```javascript
// This will disable the `info` and `debug` logging levels.
log.setLevel('warn')
```

## Scoped Logging

You can create an scoped logger, which will include the scope when logging it to
the console. e.g.:

```javascript
const { createLog } = require('@miroculus/log')

const log = createLog('my-library')

log.info('another message')
// [INFO][my-library] another message
```

## Logging Triggers

If you want to execute some callback everytime a log is emitted, you can listen
to the the events `log:${level}`, e.g:

```javascript
const log = require('@miroculus/log')

log.on('log', ({ level, scope, args }) => {
  // level === 'error'
  // scope === undefined
  const [err] = args
  // do wathever you like with the logged err object
})

log.error(new Error('some error'))
```

> A more complex example can be found at [`examples/sentry.js`](examples/sentry.js)
> which shows how to do a very simple implementation with Sentry.
