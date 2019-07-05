'use strict';

const { emptiness } = require('@metarhia/common');

const length = items => {
  if (Reflect.has(items, 'length')) {
    return items.length;
  } else if (Reflect.has(items, 'size')) {
    return items.size;
  } else {
    return 0;
  }
};

// Asynchronous map (iterate parallel)
//   items - <Array>, incoming
//   fn - <Function>, to be executed for each value in the array
//     current - <any>, current element being processed in the array
//     callback - <Function>
//       err - <Error> | <null>
//       value - <any>
//   done - <Function>, on done
//     err - <Error> | <null>
//     result - <Array>
const map = (items, fn, done = emptiness) => {
  let len = length(items);
  const result = new Array(len);
  let count = 0;
  let errored = false;

  const next = (index, err, value) => {
    if (errored) return;
    if (err) {
      errored = true;
      done(err);
      return;
    }
    result[index] = value;
    count++;
    if (count === len) {
      if (Array.isArray(items)) {
        done(null, result);
      } else {
        done(null, new items.constructor(result));
      }
    }
  };

  const iter = items[Symbol.iterator]();
  let i = 0;

  for (const val of iter) {
    fn(val, next.bind(null, i));
    i++;
  }

  if (len === 0) {
    if (i > 0) {
      len = i;
    } else {
      done(null, items);
    }
  }
};

const DEFAULT_OPTIONS = { min: 5, percent: 0.7 };

// Non-blocking synchronous map
// Signature: items, fn[, options][, done]
//   items - <Array>, incoming dataset
//   fn - <Function>
//     item - <any>
//     index - <number>
//   options - <Object>, map params, optional
//     min - <number>, min number of items in one next call
//     percent - <number>, ratio of map time to all time
//   done - <Function>, call on done, optional
//     err - <Error> | <null>
//     result - <Array>
const asyncMap = (items, fn, options = {}, done = emptiness) => {
  if (typeof options === 'function') {
    done = options;
    options = DEFAULT_OPTIONS;
  }

  let itemsArr = [];

  if (Array.isArray(items)) {
    itemsArr = items;
  } else {
    for (const item of items) {
      itemsArr.push(item);
    }
  }

  if (!itemsArr.length) {
    if (done) done(null, []);
    return;
  }

  const min = options.min || DEFAULT_OPTIONS.min;
  const percent = options.percent || DEFAULT_OPTIONS.percent;

  let begin;
  let sum = 0;
  let count = 0;

  const result = done ? new Array(itemsArr.length) : null;
  const ratio = percent / (1 - percent);

  const countNumber = () => {
    const loopTime = Date.now() - begin;
    const itemTime = sum / count;
    const necessaryNumber = (ratio * loopTime) / itemTime;
    return Math.max(necessaryNumber, min);
  };

  const next = () => {
    const itemsNumber = count ? countNumber() : min;
    const iterMax = Math.min(itemsArr.length, itemsNumber + count);

    begin = Date.now();
    for (; count < iterMax; count++) {
      const itemResult = fn(itemsArr[count], count);
      if (done) result[count] = itemResult;
    }
    sum += Date.now() - begin;

    if (count < itemsArr.length) {
      begin = Date.now();
      setTimeout(next, 0);
    } else if (done) {
      if (Array.isArray(items)) {
        done(null, result);
      } else {
        done(null, new items.constructor(result));
      }
    }
  };

  next();
};

// Asynchrous filter (iterate parallel)
//   items - <Array>, incoming
//   fn - <Function>, to be executed for each value in the array
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//       accepted - <boolean>
//   done - <Function>, on done
//     err - <Error> | <null>
//     result - <Array>
//
// Example:
// metasync.filter(
//   ['data', 'to', 'filter'],
//   (item, callback) => callback(item.length > 2),
//   (err, result) => console.dir(result)
// );
const filter = (items, fn, done) => {
  let len = length(items);

  let count = 0;
  let suitable = 0;
  const data = new Array(len);
  const rejected = Symbol('rejected');

  const next = (value, index, err, accepted) => {
    if (!accepted || err) {
      data[index] = rejected;
    } else {
      data[index] = value;
      suitable++;
    }
    count++;
    if (count === len) {
      const result = new Array(suitable);
      let pos = 0;
      for (let i = 0; i < len; i++) {
        const val = data[i];
        if (val !== rejected) result[pos++] = val;
      }
      if (Array.isArray(items)) {
        done(null, result);
      } else {
        done(null, new items.constructor(result));
      }
    }
  };

  const iter = items[Symbol.iterator]();
  let i = 0;

  for (const val of iter) {
    fn(val, next.bind(null, val, i));
    i++;
  }

  if (len === 0) {
    if (i > 0) {
      len = i;
    } else {
      done(null, items);
    }
  }
};

const REDUCE_EMPTY_ARR =
  'Metasync: reduce of empty iterable with no initial value';

// Asynchronous reduce
// Signature: items, fn, done[, initial]
//   items - <Array>, incoming
//   fn - <Function>, to be executed for each value in array
//     previous - <any>, value previously returned in the last iteration
//     current - <any>, current element being processed in the array
//     callback - <Function>, callback for returning value
//         back to reduce function
//       err - <Error> | <null>
//       data - <any>, resulting value
//     counter - <number>, index of the current element
//         being processed in array
//     items - <Array>, the array reduce was called upon
//   done - <Function>, on done
//     err - <Error> | <null>
//     result - <Array>
//   initial - <any>, optional value to be used as first
//       argument in first iteration
const reduce = (items, fn, done, initial) => {
  const hasInitial = typeof initial !== 'undefined';
  let count = hasInitial ? 0 : 1;

  const iter = items[Symbol.iterator]();
  const { done: isDone, value: first } = iter.next();

  if (isDone && !hasInitial) {
    done(new TypeError(REDUCE_EMPTY_ARR));
    return;
  }

  const previous = hasInitial ? initial : first;
  let current;

  if (hasInitial) {
    if (isDone) {
      done(null, previous);
      return;
    }
    current = first;
  } else {
    const { done: isDone, value: second } = iter.next();
    if (isDone) {
      done(null, previous);
      return;
    }
    current = second;
  }

  const next = (err, data) => {
    if (err) {
      done(err);
      return;
    }
    const { done: isDone, value: current } = iter.next();
    if (isDone) {
      done(null, data);
      return;
    }
    count++;
    fn(data, current, next, count, items);
  };

  fn(previous, current, next, count, items);
};

const REDUCE_RIGHT_EMPTY_ARR =
  'Metasync: reduceRight of empty array with no initial value';

// Asynchronous reduceRight
// Signature: items, fn, done[, initial]
//   items - <Array>, incoming
//   fn - <Function>, to be executed for each value in array
//     previous - <any>, value previously returned in the last iteration
//     current - <any>, current element being processed in the array
//     callback - <Function>, callback for returning value
//         back to reduce function
//       err - <Error> | <null>
//       data - <any>, resulting value
//     counter - <number>, index of the current element
//         being processed in array
//     items - <Array>, the array reduce was called upon
//   done - <Function>, on done
//     err - <Error> | <null>
//     result - <Array>
//   initial - <any>, optional value to be used as first
//       argument in first iteration
const reduceRight = (items, fn, done, initial) => {
  let itemsArr = [];

  if (Array.isArray(items)) {
    itemsArr = items;
  } else {
    for (const item of items) {
      itemsArr.push(item);
    }
  }

  const len = itemsArr.length;
  const hasInitial = typeof initial !== 'undefined';

  if (len === 0 && !hasInitial) {
    done(new TypeError(REDUCE_RIGHT_EMPTY_ARR), initial);
    return;
  }

  let previous = hasInitial ? initial : itemsArr[len - 1];
  if ((len === 0 && hasInitial) || (len === 1 && !hasInitial)) {
    done(null, previous);
    return;
  }

  let count = hasInitial ? len - 1 : len - 2;
  let current = itemsArr[count];
  const last = 0;

  const next = (err, data) => {
    if (err) {
      done(err);
      return;
    }
    if (count === last) {
      done(null, data);
      return;
    }
    count--;
    previous = data;
    current = itemsArr[count];
    fn(previous, current, next, count, items);
  };

  fn(previous, current, next, count, items);
};

// Asynchronous each (iterate in parallel)
//   items - <Array>, incoming
//   fn - <Function>
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//   done - <Function>, on done
//     err - <Error> | <null>
//     items - <Array>
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
const each = (items, fn, done) => {
  let len = length(items);
  let count = 0;
  let errored = false;

  const next = (index, err) => {
    if (errored) return;
    if (err) {
      errored = true;
      done(err);
      return;
    }
    count++;
    if (count === len) {
      done(null, items);
    }
  };

  const iter = items[Symbol.iterator]();
  let i = 0;

  for (const val of iter) {
    fn(val, next.bind(null, i));
    i++;
  }

  if (len === 0) {
    if (i > 0) {
      len = i;
    } else {
      done(null, items);
    }
  }
};

// Asynchronous series
//   items - <Array>, incoming
//   fn - <Function>
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//   done - <Function>, on done
//     err - <Error> | <null>
//     items - <Array>
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
const series = (items, fn, done) => {
  const iter = items[Symbol.iterator]();

  const next = () => {
    const { done: isDone, value } = iter.next();
    if (isDone) {
      done(null, items);
      return;
    }
    fn(value, err => {
      if (err) {
        done(err);
        return;
      }
      setImmediate(next);
    });
  };
  next();
};

// Asynchronous find (iterate in series)
//   items - <Array>, incoming
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
const find = (items, fn, done) => {
  let len = length(items);
  let count = 0;
  let finished = false;

  const next = (value, err, accepted) => {
    if (finished) return;
    if (err) {
      finished = true;
      done(err);
      return;
    }
    if (accepted) {
      finished = true;
      done(null, value);
      return;
    }
    count++;
    if (count === len) done(null);
  };

  const iter = items[Symbol.iterator]();
  let i = 0;

  for (const val of iter) {
    fn(val, next.bind(null, val));
    i++;
  }

  if (len === 0) {
    if (i > 0) {
      len = i;
    } else {
      done(null);
    }
  }
};

// Asynchronous every
//   items - <Array>, incoming
//   fn - <Function>,
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//       accepted - <boolean>
//   done - <Function>, on done
//     err - <Error> | <null>
//     result - <boolean>
const every = (items, fn, done) => {
  let len = length(items);
  let proceedItemsCount = 0;

  const finish = (err, accepted) => {
    if (!done) return;
    if (err || !accepted) {
      done(err, false);
      done = null;
      return;
    }
    proceedItemsCount++;
    if (proceedItemsCount === len) done(null, true);
  };

  const iter = items[Symbol.iterator]();
  let i = 0;

  for (const item of iter) {
    fn(item, finish);
    i++;
  }

  if (len === 0) {
    if (i > 0) {
      len = i;
    } else {
      done(null, true);
    }
  }
};

// Asynchronous some (iterate in series)
//   items - <Array>, incoming
//   fn - <Function>
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//       accepted - <boolean>
//   done - <Function>, on done
//     err - <Error> | <null>
//     result - <boolean>
const some = (items, fn, done) => {
  const iter = items[Symbol.iterator]();

  const next = () => {
    const { done: isDone, value } = iter.next();
    if (isDone) {
      done(null, false);
      return;
    }
    fn(value, (err, accepted) => {
      if (err) {
        done(err);
        return;
      }
      if (accepted) {
        done(null, true);
        return;
      }
      next();
    });
  };

  next();
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
