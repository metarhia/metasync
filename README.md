# Asynchronous Programming Library

[![TravisCI](https://travis-ci.org/metarhia/metasync.svg?branch=master)](https://travis-ci.org/metarhia/metasync)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/60fe108b31614b4191cd557d49112169)](https://www.codacy.com/app/metarhia/metasync)
[![NPM Version](https://badge.fury.io/js/metasync.svg)](https://badge.fury.io/js/metasync)
[![NPM Downloads/Month](https://img.shields.io/npm/dm/metasync.svg)](https://www.npmjs.com/package/metasync)
[![NPM Downloads](https://img.shields.io/npm/dt/metasync.svg)](https://www.npmjs.com/package/metasync)

## Installation

```bash
$ npm install metasync
```

## Asynchronous functions composition
`metasync(fns)([data], done)`
- `fns` - array of callback-last functions, callback contranct err-first
- `[data]` - input data (optional)
- `done` - err-first callback
- Returns: composed callback-last / err-first function

![composition](https://cloud.githubusercontent.com/assets/4405297/16968374/1b81f160-4e17-11e6-96fa-9d7e2b422396.png)

```JavaScript
const composed = metasync(
  [f1, f2, f3, [[f4, f5, [f6, f7], f8]], f9]
);
```

- Array of functions gives sequential execution: `[f1, f2, f3]`
- Double brackets array of functions gives parallel execution: `[[f1, f2, f3]]`

### Composed methods:
- `composed([data], callback)` - async composed, callback-last and err-first contracts
- `composed.timeout(msec)` - set timeout
- `composed.cancel()` - calcel execution where possible
- `composed.clone()` - clone composed
- `composed.pause()` - pause execution
- `composed.resume()` - resume execution

## Collector
`metasync.collect(expected)(key, error, value)`
- expected - count or array of string
- Returns: collector instance

### Collector methods:
- `collector.collect(key, error, value)` - pick or fail
- `collector.pick(key, value)` - pick a key
- `collector.fail(key, error)` - fail a key
- `collector.take(key, method, ...arguments)` - take method result
- `collector.timeout(msec)` - set timeout
- `collector.done(callback)` - set done listener with err-first contract
- `collector.distinct(true/false)` - deny unlisted keys

Example:
```JavaScript
const metasync = require('metasync');
const fs = require('fs');

// Data collector (collect keys by count)
const dc = metasync.collect(4);

dc.pick('user', { name: 'Marcus Aurelius' });
fs.readFile('HISTORY.md',
  (err, data) => dc.collect('history', err, data)
);
dc.take('readme', fs.readFile, 'README.md');
setTimeout(() => dc.pick('timer', { date: new Date() }), 1000);

// Key collector (collect certain keys by names)
const kc = metasync
  .collect(['user', 'history', 'readme', 'timer'])
  .timeout(2000)
  .distinct()
  .done((err, data) => console.log(data));

kc.pick('user', { name: 'Marcus Aurelius' });
kc.take('history', fs.readFile, 'HISTORY.md');
kc.take('readme', fs.readFile, 'README.md');
setTimeout(() => kc.pick('timer', { date: new Date() }), 1000);
```

## Parallel execution
`metasync.parallel(fns, data, callback)`
- `fns` - array of callback-last functions, callback contranct err-first
- `data` - incoming data (optional)
- `callback` - err-first function on done

Example:
`metasync.parallel([f1, f2, f3], (err, data) => {});`

## Sequential execution
`metasync.sequential(fns, data, callback)`
- `fns` - array of callback-last functions, callback contranct err-first
- `data` - incoming data (optional)
- `callback` - err-first function on done

Example:
```JavaScript
metasync.sequential([f1, f2, f3], (err, data) => {});
```

## Executes all asynchronous functions and pass first result to callback
`metasync.firstOf(fns, callback)`
- `fns` - array of callback-last functions, callback contranct err-first
- `callback` - err-first function on done

## Asynchronous map (iterate parallel)
`metasync.map(items, fn, done)`
- `items` - incoming array
- `fn` - callback-last `(current, callback) => callback(err, value)`
  - to be executed for each value in the array
  - `current` - current element being processed in the array
  - `callback` - err-first
- `done` - optional err-first callback

## Asynchrous filter (iterate parallel)
`metasync.filter(items)`
- `items` - incoming array

Example:
```JavaScript
metasync.filter(
  ['data', 'to', 'filter'],
  (item, callback) => callback(item.length > 2),
  (err, result) => console.dir(result)
);
```

## Asynchronous reduce
`metasync.reduce(items, callback, done, initial)`
- `items` - incoming array
- `callback` - function to be executed for each value in array
  - `previous` - value previously returned in the last iteration
  - `current` - current element being processed in the array
  - `callback` - callback for returning value back to function reduce
  - `counter` - index of the current element being processed in array
  - `items` - the array reduce was called upon
- `done` - optional on done callback `function(err, result)`
- `initial` - optional value to be used as first arpument in first iteration

## Asynchronous each (iterate in parallel)
`metasync.each(items, fn, done)`
- `items` - incoming array
- `fn` - callback-last `(value, callback) => callback(err)`
  - `value` - item from items array
  - `callback` - callback `function(err)`
- `done` - optional on done callback `function(err)`

Example:
```JavaScript
metasync.each(
  ['a', 'b', 'c'],
  (item, callback) => {
    console.dir({ each: item });
    callback();
  },
  (err, data) => console.dir('each done')
);
```

## Asynchronous series
`metasync.series(items, fn, done)`
- `items` - incoming array
- `fn` - callback-last `(value, callback) => callback(err)`
  - `value` - item from items array
  - `callback` - callback `(err)`
- `done` optional on done callback `function(err)`

Example:
```JavaScript
metasync.series(
  ['a', 'b', 'c'],
  (item, callback) => {
    console.dir({ series: item });
    callback();
  },
  (err, data) => {
    console.dir('series done');
  }
);
```

## Asynchronous find (iterate in series)
`metasync.find(items, fn, done)`
- `items` - incoming array
- `fn` - callback-last `(value, callback) => callback(err, accepted)`
  - `value` - item from items array
  - `callback` - callback function `(err, accepted)`
- `done` - optional on done callback `function(err, result)`

Example:
```JavaScript
metasync.find(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  (item, callback) => (
    callback(null, item % 3 === 0 && item % 5 === 0)
  ),
  (err, result) => {
    console.dir(result);
  }
);
```

## Asynchronous every
`metasync.every(items, fn, done)`
- `items` - incoming array
- `fn` - callback-last `(value, callback) => callback(err, fits)`
  - `value` - item from items array
  - `callback` - callback function `(err, fits)`
- `done` - optional on done callback `function(err, result)`

## Asynchronous some (iterate in series)
`metasync.some(items)`
- `items` - incoming array

## Create an ArrayChain instance
`metasync.for(array)`
- `array` - start mutations from this data

## ConcurrentQueue
`new metasync.ConcurrentQueue(concurrency, timeout)`
- `concurrency` - number of simultaneous and asynchronously executing tasks
- `timeout` - process timeout (optional), for single item

## Function throttling, executed once per interval
`metasync.throttle(timeout, fn, ...args)`
- `timeout` - msec interval
- `fn` - function to be throttled
- `...args` - arguments for fn (optional)

## Debounce function, delayed execution
`metasync.debounce(timeout, fn, ...args)`
- `timeout` - msec
- `fn` - function to be debounced
- `...args` - arguments for fn (optional)

## Set timeout for asynchronous function execution
`metasync.timeout(timeout, fn, callback)`
- `timeout` - time interval
- `fn` - async function to be executed
- `callback` - callback function on done

## Queue instantiation
`metasync.queue(concurrency)`
- `concurrency` - number of simultaneous and asynchronously executing tasks

## Transforms function with args arguments and callback
to function with args as separate values and callback
`metasync.toAsync(fn)`
- `fn` - function contract callback-last, callback contranct err-first
- Returns: function with arguments gathered from args as separate values
and callback

## Async function
`metasync.asAsync(fn, ...args)`
- `fn` - function
- `...args` - its arguments

## Convert source to callback-last contract
`metasync.callbackify(source)`
- `source` - promise or regular synchronous function
- Returns: callback, function

## Convert async function to Promise object
`metasync.promisify(func)`
- `func:function` - callback-last function
- Returns: object, Promise instance

## Convert sync function to Promise object
`metasync.promisifySync(func)`
- `func:function` - regular synchronous function
- Returns: object, Promise instance

## Contributors

  - Timur Shemsedinov (marcusaurelius)
  - See github for full [contributors list](https://github.com/metarhia/metasync/graphs/contributors)
