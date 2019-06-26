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

`metasync(fns)(data, done)`

- `fns` - array of callback-last functions, callback contranct err-first
- `data` - input data (optional)
- `done` - err-first callback
- Returns: composed callback-last / err-first function

![composition](https://cloud.githubusercontent.com/assets/4405297/16968374/1b81f160-4e17-11e6-96fa-9d7e2b422396.png)

```js
const composed = metasync([f1, f2, f3, [[f4, f5, [f6, f7], f8]], f9]);
```

- Array of functions gives sequential execution: `[f1, f2, f3]`
- Double brackets array of functions gives parallel execution: `[[f1, f2, f3]]`

_Example:_

```js
const metasync = require('metasync');
const fs = require('fs');

// Data collector (collect keys by count)
const dc = metasync.collect(4);

dc.pick('user', { name: 'Marcus Aurelius' });
fs.readFile('HISTORY.md', (err, data) => dc.collect('history', err, data));
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

## API

### callbackify(fn)

- `fn`: [`<Function>`][function] promise-returning function

_Returns:_ [`<Function>`][function]

Convert Promise-returning to callback-last / error-first contract

### asyncify(fn)

- `fn`: [`<Function>`][function] regular synchronous function

_Returns:_ [`<Function>`][function] with contract: callback-last / error-first

Convert sync function to callback-last / error-first contract

### promiseToCallbackLast(promise, callback)

- `promise`: [`<Promise>`][promise]
- `callback`: [`<Function>`][function]

Convert Promise to callback-last

### promisify(fn)

- `fn`: [`<Function>`][function] callback-last function

_Returns:_ [`<Function>`][function] Promise-returning function

Convert async function to Promise-returning function

### promisifySync(fn)

- `fn`: [`<Function>`][function] regular synchronous function

_Returns:_ [`<Function>`][function] Promise-returning function

Convert sync function to Promise object

### map(items, fn, done)

- `items`: [`<Array>`][array] incoming
- `fn`: [`<Function>`][function] to be executed for each value in the array
  - `current`: `<any>` current element being processed in the array
  - `callback`: [`<Function>`][function]
    - `err`: [`<Error>`][error]|[`<null>`][null]
    - `value`: `<any>`
- `done`: [`<Function>`][function] on done
  - `err`: [`<Error>`][error]|[`<null>`][null]
  - `result`: [`<Array>`][array]

Asynchronous map (iterate parallel)

### filter(items, fn, done)

- `items`: [`<Array>`][array] incoming
- `fn`: [`<Function>`][function] to be executed for each value in the array
  - `value`: `<any>` item from items array
  - `callback`: [`<Function>`][function]
    - `err`: [`<Error>`][error]|[`<null>`][null]
    - `accepted`: [`<boolean>`][boolean]
- `done`: [`<Function>`][function] on done
  - `err`: [`<Error>`][error]|[`<null>`][null]
  - `result`: [`<Array>`][array]

Asynchrous filter (iterate parallel)

_Example:_

```js
metasync.filter(
  ['data', 'to', 'filter'],
  (item, callback) => callback(item.length > 2),
  (err, result) => console.dir(result)
);
```

### reduce(items, fn, done\[, initial\])

- `items`: [`<Array>`][array] incoming
- `fn`: [`<Function>`][function] to be executed for each value in array
  - `previous`: `<any>` value previously returned in the last iteration
  - `current`: `<any>` current element being processed in the array
  - `callback`: [`<Function>`][function] callback for returning value back to
    reduce function
    - `err`: [`<Error>`][error]|[`<null>`][null]
    - `data`: `<any>` resulting value
  - `counter`: [`<number>`][number] index of the current element being processed
    in array
  - `items`: [`<Array>`][array] the array reduce was called upon
- `done`: [`<Function>`][function] on done
  - `err`: [`<Error>`][error]|[`<null>`][null]
  - `result`: [`<Array>`][array]
- `initial`: `<any>` optional value to be used as first argument in first
  iteration

Asynchronous reduce

### reduceRight(items, fn, done\[, initial\])

- `items`: [`<Array>`][array] incoming
- `fn`: [`<Function>`][function] to be executed for each value in array
  - `previous`: `<any>` value previously returned in the last iteration
  - `current`: `<any>` current element being processed in the array
  - `callback`: [`<Function>`][function] callback for returning value back to
    reduce function
    - `err`: [`<Error>`][error]|[`<null>`][null]
    - `data`: `<any>` resulting value
  - `counter`: [`<number>`][number] index of the current element being processed
    in array
  - `items`: [`<Array>`][array] the array reduce was called upon
- `done`: [`<Function>`][function] on done
  - `err`: [`<Error>`][error]|[`<null>`][null]
  - `result`: [`<Array>`][array]
- `initial`: `<any>` optional value to be used as first argument in first
  iteration

Asynchronous reduceRight

### each(items, fn, done)

- `items`: [`<Array>`][array] incoming
- `fn`: [`<Function>`][function]
  - `value`: `<any>` item from items array
  - `callback`: [`<Function>`][function]
    - `err`: [`<Error>`][error]|[`<null>`][null]
- `done`: [`<Function>`][function] on done
  - `err`: [`<Error>`][error]|[`<null>`][null]
  - `items`: [`<Array>`][array]

Asynchronous each (iterate in parallel)

_Example:_

```js
metasync.each(
  ['a', 'b', 'c'],
  (item, callback) => {
    console.dir({ each: item });
    callback();
  },
  (err, data) => console.dir('each done')
);
```

### series(items, fn, done)

- `items`: [`<Array>`][array] incoming
- `fn`: [`<Function>`][function]
  - `value`: `<any>` item from items array
  - `callback`: [`<Function>`][function]
    - `err`: [`<Error>`][error]|[`<null>`][null]
- `done`: [`<Function>`][function] on done
  - `err`: [`<Error>`][error]|[`<null>`][null]
  - `items`: [`<Array>`][array]

Asynchronous series

_Example:_

```js
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

### find(items, fn, done)

- `items`: [`<Array>`][array] incoming
- `fn`: [`<Function>`][function]
  - `value`: `<any>` item from items array
  - `callback`: [`<Function>`][function]
    - `err`: [`<Error>`][error]|[`<null>`][null]
    - `accepted`: [`<boolean>`][boolean]
- `done`: [`<Function>`][function] on done
  - `err`: [`<Error>`][error]|[`<null>`][null]
  - `result`: `<any>`

Asynchronous find (iterate in series)

_Example:_

```js
metasync.find(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  (item, callback) => callback(null, item % 3 === 0 && item % 5 === 0),
  (err, result) => {
    console.dir(result);
  }
);
```

### every(items, fn, done)

- `items`: [`<Array>`][array] incoming
- `fn`: [`<Function>`][function]
  - `value`: `<any>` item from items array
  - `callback`: [`<Function>`][function]
    - `err`: [`<Error>`][error]|[`<null>`][null]
    - `accepted`: [`<boolean>`][boolean]
- `done`: [`<Function>`][function] on done
  - `err`: [`<Error>`][error]|[`<null>`][null]
  - `result`: [`<boolean>`][boolean]

Asynchronous every

### some(items, fn, done)

- `items`: [`<Array>`][array] incoming
- `fn`: [`<Function>`][function]
  - `value`: `<any>` item from items array
  - `callback`: [`<Function>`][function]
    - `err`: [`<Error>`][error]|[`<null>`][null]
    - `accepted`: [`<boolean>`][boolean]
- `done`: [`<Function>`][function] on done
  - `err`: [`<Error>`][error]|[`<null>`][null]
  - `result`: [`<boolean>`][boolean]

Asynchronous some (iterate in series)

### asyncMap(items, fn\[, options\]\[, done\])

- `items`: [`<Array>`][array] incoming dataset
- `fn`: [`<Function>`][function]
  - `item`: `<any>`
  - `index`: [`<number>`][number]
- `options`: [`<Object>`][object] map params, optional
  - `min`: [`<number>`][number] min number of items in one next call
  - `percent`: [`<number>`][number] ratio of map time to all time
- `done`: [`<Function>`][function] call on done, optional
  - `err`: [`<Error>`][error]|[`<null>`][null]
  - `result`: [`<Array>`][array]

Non-blocking synchronous map

### asyncIter(base)

- `base`: [`<Iterable>`][iterable]|[`<AsyncIterable>`][asynciterable] an
  iterable that is wrapped in [`<AsyncIterator>`][asynciterator]

_Returns:_ [`<AsyncIterator>`][asynciterator]

Create an AsyncIterator instance

### class AsyncIterator

#### AsyncIterator.prototype.constructor(base)

#### async AsyncIterator.prototype.next()

#### async AsyncIterator.prototype.count()

#### async AsyncIterator.prototype.each(fn, thisArg)

#### async AsyncIterator.prototype.forEach(fn, thisArg)

#### async AsyncIterator.prototype.parallel(fn, thisArg)

#### async AsyncIterator.prototype.every(predicate, thisArg)

#### async AsyncIterator.prototype.find(predicate, thisArg)

#### async AsyncIterator.prototype.includes(element)

#### async AsyncIterator.prototype.reduce(reducer, initialValue)

#### async AsyncIterator.prototype.some(predicate, thisArg)

#### async AsyncIterator.prototype.someCount(predicate, count, thisArg)

#### async AsyncIterator.prototype.collectTo(CollectionClass)

#### async AsyncIterator.prototype.collectWith(obj, collector)

#### async AsyncIterator.prototype.join(sep = ', ', prefix = '', suffix = '')

#### async AsyncIterator.prototype.toArray()

#### AsyncIterator.prototype.map(mapper, thisArg)

#### AsyncIterator.prototype.filter(predicate, thisArg)

#### AsyncIterator.prototype.flat(depth = 1)

#### AsyncIterator.prototype.flatMap(mapper, thisArg)

#### AsyncIterator.prototype.zip(...iterators)

#### AsyncIterator.prototype.chain(...iterators)

#### AsyncIterator.prototype.take(amount)

#### AsyncIterator.prototype.takeWhile(predicate, thisArg)

#### AsyncIterator.prototype.skip(amount)

#### AsyncIterator.prototype.throttle(percent, min)

#### AsyncIterator.prototype.enumerate()

### collect(expected)

- `expected`: [`<number>`][number]|[`<string[]>`][string]

_Returns:_ [`<Collector>`][collector]

Create Collector instance

### class Collector

Data collector

#### Collector.prototype.constructor(expected)

- `expected`: [`<number>`][number]|[`<string[]>`][string] count or keys

Data collector

#### Collector.prototype.collect(key, err, value)

- `key`: [`<string>`][string]
- `err`: [`<Error>`][error]
- `value`: `<any>`

_Returns:_ [`<this>`][this]

Pick or fail key

#### Collector.prototype.pick(key, value)

- `key`: [`<string>`][string]
- `value`: `<any>`

_Returns:_ [`<this>`][this]

Pick key

#### Collector.prototype.fail(key, err)

- `key`: [`<string>`][string]
- `err`: [`<Error>`][error]

_Returns:_ [`<this>`][this]

Fail key

#### Collector.prototype.take(key, fn, args)

- `key`: [`<string>`][string]
- `fn`: [`<Function>`][function]
- `args`: [`<Array>`][array] rest arguments, to be passed in fn

_Returns:_ [`<this>`][this]

Take method result

#### Collector.prototype.timeout(msec)

- `msec`: [`<number>`][number]

_Returns:_ [`<this>`][this]

Set timeout

#### Collector.prototype.done(callback)

- `callback`: [`<Function>`][function]
  - `err`: [`<Error>`][error]
  - `data`: `<any>`

_Returns:_ [`<this>`][this]

Set on done listener

#### Collector.prototype.finalize(key, err, data)

#### Collector.prototype.distinct(value)

- `value`: [`<boolean>`][boolean]

_Returns:_ [`<this>`][this]

Deny or allow unlisted keys

#### Collector.prototype.cancel(err)

#### Collector.prototype.then(fulfill, reject)

### compose(flow)

- `flow`: [`<Function[]>`][function] callback-last / err-first

_Returns:_ [`<Function>`][function] composed callback-last / err-first

Asynchronous functions composition

Array of functions results in sequential execution: `[f1, f2, f3]` Double
brackets array of functions results in parallel execution: `[[f1, f2, f3]]`

_Example:_

```js
const composed = metasync([f1, f2, f3, [[f4, f5, [f6, f7], f8]], f9]);
```

### class Composition

#### Composition.prototype.constructor()

#### Composition.prototype.on(name, callback)

#### Composition.prototype.finalize(err)

#### Composition.prototype.collect(err, result)

#### Composition.prototype.parallel()

#### Composition.prototype.sequential()

#### Composition.prototype.then(fulfill, reject)

#### Composition.prototype.clone()

Clone composed

#### Composition.prototype.pause()

Pause execution

#### Composition.prototype.resume()

Resume execution

#### Composition.prototype.timeout(msec)

- `msec`: [`<number>`][number]

Set timeout

#### Composition.prototype.cancel()

Cancel execution where possible

### firstOf(fns, callback)

- `fns`: [`<Function[]>`][function] callback-last / err-first
- `callback`: [`<Function>`][function] on done, err-first

Executes all asynchronous functions and pass first result to callback

### parallel(fns\[, context\], callback)

- `fns`: [`<Function[]>`][function] callback-last / err-first
- `context`: [`<Object>`][object] incoming data, optional
- `callback`: [`<Function>`][function] on done, err-first

Parallel execution

_Example:_

```js
metasync.parallel([f1, f2, f3], (err, data) => {});
```

### sequential(fns\[, context\], callback)

- `fns`: [`<Function[]>`][function] callback-last with err-first contract
- `context`: [`<Object>`][object] incoming data, optional
- `callback`: [`<Function>`][function] err-first on done

Sequential execution

_Example:_

```js
metasync.sequential([f1, f2, f3], (err, data) => {});
```

### runIf(condition\[, defaultVal\], asyncFn, ...args)

- `condition`: `<any>`
- `defaultVal`: `<any>` optional, value that will be returned to callback if
  `condition` is falsy.
- `asyncFn`: [`<Function>`][function] callback-last function that will be
  executed if `condition` if truthy
- `args`: `<any[]>` args to pass to `asyncFn`

Run `asyncFn` if `condition` is truthy, else return `defaultVal` to callback.

### runIfFn(asyncFn, ...args)

- `asyncFn`: [`<Function>`][function] callback-last function that will be
  executed if it is provided
- `args`: `<any[]>` args to pass to `asyncFn`

Run `asyncFn` if it is provided

### class do

#### do.prototype.constructor(fn, ...args)

### toAsync(fn)

- `fn`: [`<Function>`][function] callback-last / err-first

_Returns:_ [`<Function>`][function]

Convert synchronous function to asynchronous

Transform function with args arguments and callback to function with args as
separate values and callback

### asAsync(fn, args)

- `fn`: [`<Function>`][function] asynchronous
- `args`: [`<Array>`][array] its arguments

Wrap function adding async chain methods

### of(args)

- `args`: [`<Array>`][array]

Applicative f => a -> f a

### concat(fn1, fn2)

- `fn1`: [`<Function>`][function]
- `fn2`: [`<Function>`][function]

Monoid m => a -> a -> a

### fmap(fn1, f)

- `fn1`: [`<Function>`][function]
- `f`: [`<Function>`][function]

Functor f => (a -> b) -> f a -> f b

### ap(fn, funcA)

- `fn`: [`<Function>`][function]
- `funcA`: [`<Function>`][function]

Applicative f => f (a -> b) -> f a -> f b

### memoize(fn)

- `fn`: [`<Function>`][function] sync or async

_Returns:_ [`<Function>`][function] memoized

Create memoized function

### class Memoized

#### Memoized.prototype.constructor()

#### Memoized.prototype.clear()

#### Memoized.prototype.add(key, err, data)

#### Memoized.prototype.del(key)

#### Memoized.prototype.get(key, callback)

#### Memoized.prototype.on(eventName, listener)

- `eventName`: [`<string>`][string]
- `listener`: [`<Function>`][function] handler

Add event listener

_Example:_

```js
const memoized = new Memoized();
memoized.on('memoize', (err, data) => { ... });
memoized.on('add', (key, err, data) => { ... });
memoized.on('del', (key) => { ... })
memoized.on('clear', () => { ... });
```

#### Memoized.prototype.emit(eventName, args)

- `eventName`: [`<string>`][string]
- `args`: `<any>` rest arguments

Emit Memoized events

### poolify(factory, min, norm, max)

### queue(concurrency)

- `concurrency`: [`<number>`][number] simultaneous and asynchronously executing
  tasks

_Returns:_ [`<Queue>`][queue]

Create Queue instance

### class Queue

Queue constructor

#### Queue.prototype.constructor(concurrency)

- `concurrency`: [`<number>`][number] asynchronous concurrency

Queue constructor

#### Queue.prototype.wait(msec)

- `msec`: [`<number>`][number] wait timeout for single item

_Returns:_ [`<this>`][this]

Set wait before processing timeout

#### Queue.prototype.throttle(count\[, interval\])

- `count`: [`<number>`][number] item count
- `interval`: [`<number>`][number] per interval, optional default: 1000 msec

_Returns:_ [`<this>`][this]

Throttle to limit throughput

#### Queue.prototype.add(item\[, factor\[, priority\]\])

- `item`: [`<Object>`][object] to be added
- `factor`: [`<number>`][number]|[`<string>`][string] type, source, destination
  or path, optional
- `priority`: [`<number>`][number] optional

_Returns:_ [`<this>`][this]

Add item to queue

#### Queue.prototype.next(task)

- `task`: [`<Array>`][array] next task [item, factor, priority]

_Returns:_ [`<this>`][this]

Process next item

#### Queue.prototype.takeNext()

_Returns:_ [`<this>`][this]

Prepare next item for processing

#### Queue.prototype.pause()

_Returns:_ [`<this>`][this]

Pause queue

This function is not completely implemented yet

#### Queue.prototype.resume()

_Returns:_ [`<this>`][this]

Resume queue

This function is not completely implemented yet

#### Queue.prototype.clear()

_Returns:_ [`<this>`][this]

Clear queue

#### Queue.prototype.timeout(msec, onTimeout)

- `msec`: [`<number>`][number] process timeout for single item
- `onTimeout`: [`<Function>`][function]

_Returns:_ [`<this>`][this]

Set timeout interval and listener

#### Queue.prototype.process(fn)

- `fn`: [`<Function>`][function]
  - `item`: [`<Object>`][object]
  - `callback`: [`<Function>`][function]
    - `err`: [`<Error>`][error]|[`<null>`][null]
    - `result`: `<any>`

_Returns:_ [`<this>`][this]

Set processing function

#### Queue.prototype.done(fn)

- `fn`: [`<Function>`][function] done listener
  - `err`: [`<Error>`][error]|[`<null>`][null]
  - `result`: `<any>`

_Returns:_ [`<this>`][this]

Set listener on processing done

#### Queue.prototype.success(listener)

- `listener`: [`<Function>`][function] on success
  - `item`: `<any>`

_Returns:_ [`<this>`][this]

Set listener on processing success

#### Queue.prototype.failure(listener)

- `listener`: [`<Function>`][function] on failure
  - `err`: [`<Error>`][error]|[`<null>`][null]

_Returns:_ [`<this>`][this]

Set listener on processing error

#### Queue.prototype.drain(listener)

- `listener`: [`<Function>`][function] on drain

_Returns:_ [`<this>`][this]

Set listener on drain Queue

#### Queue.prototype.fifo()

_Returns:_ [`<this>`][this]

Switch to FIFO mode (default for Queue)

#### Queue.prototype.lifo()

_Returns:_ [`<this>`][this]

Switch to LIFO mode

#### Queue.prototype.priority(flag)

- `flag`: [`<boolean>`][boolean] default: true, false will disable priority mode

_Returns:_ [`<this>`][this]

Activate or deactivate priority mode

#### Queue.prototype.roundRobin(flag)

- `flag`: [`<boolean>`][boolean] default: true, false will disable roundRobin
  mode

_Returns:_ [`<this>`][this]

Activate or deactivate round robin mode

#### Queue.prototype.pipe(dest)

- `dest`: [`<Queue>`][queue] destination queue

_Returns:_ [`<this>`][this]

Pipe processed items to different queue

### throttle(timeout, fn, ...args)

- `timeout`: [`<number>`][number] msec interval
- `fn`: [`<Function>`][function] to be throttled
- `args`: [`<Array>`][array] arguments for fn, optional

_Returns:_ [`<Function>`][function]

Get throttling function, executed once per interval

### debounce(timeout, fn, ...args)

- `timeout`: [`<number>`][number] msec
- `fn`: [`<Function>`][function] to be debounced
- `args`: [`<Array>`][array] arguments for fn, optional

Debounce function, delayed execution

### timeout(timeout, fn, callback)

- `timeout`: [`<number>`][number] time interval
- `fn`: [`<Function>`][function] to be executed
- `callback`: [`<Function>`][function] callback(...args), on done
  - `args`: [`<Array>`][array]

Set timeout for asynchronous function execution

## Contributors

- Timur Shemsedinov (marcusaurelius)
- See github for full [contributors list](https://github.com/metarhia/metasync/graphs/contributors)

[asynciterable]: https://tc39.github.io/ecma262/#sec-asynciterable-interface
[asynciterator]: #class-asynciterator
[collector]: #class-collector
[queue]: #class-queue
[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[null]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Null_type
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[iterable]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
[this]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
