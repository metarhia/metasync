'use strict';

const common = require('@metarhia/common');
const { asyncIter } = require('./async-iterator.js');
const { promisify } = require('util');

// Asynchronous map (iterate parallel)
//   items - <Iterable>, incoming
//   fn - <Function>, to be executed for each value in the array
//     current - <any>, current element being processed in the array
//     callback - <Function>
//       err - <Error> | <null>
//       value - <any>
//   done - <Function>, on done
//     err - <Error> | <null>
//     result - <Iterable>
const map = (items, fn, done = common.emptiness) => {
  const isArray = Array.isArray(items);
  asyncIter(items)
    .parallel(promisify(fn))
    .then(res => done(null, isArray ? res : new items.constructor(res)))
    .catch(done);
};

// Non-blocking synchronous map
// Signature: items, fn[, options][, done]
//   items - <Iterable>, incoming dataset
//   fn - <Function>
//     item - <any>
//     index - <number>
//   options - <Object>, map params, optional
//     min - <number>, min number of items in one next call
//     percent - <number>, ratio of map time to all time
//   done - <Function>, call on done, optional
//     err - <Error> | <null>
//     result - <Iterable>
const asyncMap = (items, fn, options = {}, done = common.emptiness) => {
  if (typeof options === 'function') {
    done = options;
    options = {};
  }
  const isArray = Array.isArray(items);
  const iter = asyncIter(items)
    .map(promisify(fn))
    .throttle(options.percent, options.min);
  const collect = isArray ? iter.toArray() : iter.collectTo(items.constructor);
  collect.then(res => done(null, res)).catch(done);
};

// Asynchronous filter (iterate parallel)
//   items - <Iterable>, incoming
//   fn - <Function>, to be executed for each value in the array
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//       accepted - <boolean>
//   done - <Function>, on done
//     err - <Error> | <null>
//     result - <Iterable>
//
// Example:
// metasync.filter(
//   ['data', 'to', 'filter'],
//   (item, callback) => callback(item.length > 2),
//   (err, result) => console.dir(result)
// );
const filter = (items, fn, done = common.emptiness) => {
  const isArray = Array.isArray(items);
  asyncIter(items)
    .parallel(async item => [await promisify(fn)(item), item])
    .then(res => {
      const filtered = common
        .iter(res)
        .filterMap(
          ([predicateResult, item]) => (predicateResult ? item : false),
          null,
          false
        );
      done(
        null,
        isArray ? filtered.toArray() : new items.constructor(filtered)
      );
    })
    .catch(done);
};

// Asynchronous reduce
// Signature: items, fn, done[, initial]
//   items - <Iterable>, incoming
//   fn - <Function>, to be executed for each value in array
//     previous - <any>, value previously returned in the last iteration
//     current - <any>, current element being processed in the array
//     callback - <Function>, callback for returning value
//         back to reduce function
//       err - <Error> | <null>
//       data - <any>, resulting value
//     counter - <number>, index of the current element
//         being processed in array
//     items - <Iterable>, the array reduce was called upon
//   done - <Function>, on done, optional
//     err - <Error> | <null>
//     result - <Iterable>
//   initial - <any>, optional value to be used as first
//       argument in first iteration
const reduce = (items, fn, done = common.emptiness, initial) => {
  asyncIter(items)
    .reduce((prev, cur) => promisify(fn)(prev, cur), initial)
    .then(res => done(null, res))
    .catch(done);
};

// Asynchronous reduceRight
// Signature: items, fn, done[, initial]
//   items - <Iterable>, incoming
//   fn - <Function>, to be executed for each value in array
//     previous - <any>, value previously returned in the last iteration
//     current - <any>, current element being processed in the array
//     callback - <Function>, callback for returning value
//         back to reduce function
//       err - <Error> | <null>
//       data - <any>, resulting value
//     counter - <number>, index of the current element
//         being processed in array
//     items - <Iterable>, the array reduce was called upon
//   done - <Function>, on done, optional
//     err - <Error> | <null>
//     result - <Iterable>
//   initial - <any>, optional value to be used as first
//       argument in first iteration
const reduceRight = (items, fn, done = common.emptiness, initial) => {
  asyncIter(items)
    .reduceRight((prev, cur) => promisify(fn)(prev, cur), initial)
    .then(res => done(null, res))
    .catch(done);
};

// Asynchronous each (iterate in parallel)
//   items - <Iterable>, incoming
//   fn - <Function>
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//   done - <Function>, on done
//     err - <Error> | <null>
//     items - <Iterable>
//
// Example:
// metasync.each(
//   ['a', 'b', 'c'],
//   (item, callback) => {
//     console.dir({ each: item });
//     callback();
//   },
//   (err, data) => console.dir('each done')
// );
const each = (items, fn, done = common.emptiness) => {
  asyncIter(items)
    .parallel(promisify(fn))
    .then(res => done(null, res))
    .catch(done);
};

// Asynchronous series
//   items - <Iterable>, incoming
//   fn - <Function>
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//   done - <Function>, on done
//     err - <Error> | <null>
//     items - <Iterable>
//
// Example:
// metasync.series(
//   ['a', 'b', 'c'],
//   (item, callback) => {
//     console.dir({ series: item });
//     callback();
//   },
//   (err, data) => {
//     console.dir('series done');
//   }
// );
const series = (items, fn, done = common.emptiness) => {
  asyncIter(items)
    .each(promisify(fn))
    .then(res => done(null, res))
    .catch(done);
};

// Asynchronous find (iterate in series)
//   items - <Iterable>, incoming
//   fn - <Function>,
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//       accepted - <boolean>
//   done - <Function>, on done
//     err - <Error> | <null>
//     result - <any>
//
// Example:
// metasync.find(
//   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
//   (item, callback) => callback(null, item % 3 === 0 && item % 5 === 0),
//   (err, result) => {
//     console.dir(result);
//   }
// );
const find = (items, fn, done = common.emptiness) => {
  asyncIter(items)
    .find(promisify(fn))
    .then(res => done(null, res))
    .catch(done);
};

// Asynchronous every
//   items - <Iterable>, incoming
//   fn - <Function>,
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//       accepted - <boolean>
//   done - <Function>, on done
//     err - <Error> | <null>
//     result - <boolean>
const every = (items, fn, done = common.emptiness) => {
  asyncIter(items)
    .parallel(promisify(fn))
    .then(res => done(null, res.every(e => e)))
    .catch(done);
};

// Asynchronous some (iterate in series)
//   items - <Iterable>, incoming
//   fn - <Function>
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//       accepted - <boolean>
//   done - <Function>, on done
//     err - <Error> | <null>
//     result - <boolean>
const some = (items, fn, done = common.emptiness) => {
  asyncIter(items)
    .some(promisify(fn))
    .then(res => done(null, res))
    .catch(done);
};

module.exports = {
  map,
  filter,
  reduce,
  reduceRight,
  each,
  series,
  find,
  every,
  some,
  asyncMap,
};
