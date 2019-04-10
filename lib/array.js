'use strict';

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
const map = (items, fn, done) => {
  const len = items.length;
  if (!len) {
    done(null, []);
    return;
  }
  let errored = false;
  let count = 0;
  const result = new Array(len);

  const next = (index, err, value) => {
    if (errored) return;
    if (err) {
      errored = true;
      done(err);
      return;
    }
    result[index] = value;
    count++;
    if (count === len) done(null, result);
  };

  for (let i = 0; i < len; i++) {
    fn(items[i], next.bind(null, i));
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
const asyncMap = (items, fn, options = {}, done) => {
  if (typeof options === 'function') {
    done = options;
    options = DEFAULT_OPTIONS;
  }

  if (!items.length) {
    if (done) done(null, []);
    return;
  }

  const min = options.min || DEFAULT_OPTIONS.min;
  const percent = options.percent || DEFAULT_OPTIONS.percent;

  let begin;
  let sum = 0;
  let count = 0;

  const result = done ? new Array(items.length) : null;
  const ratio = percent / (1 - percent);

  const countNumber = () => {
    const loopTime = Date.now() - begin;
    const itemTime = sum / count;
    const necessaryNumber = (ratio * loopTime) / itemTime;
    return Math.max(necessaryNumber, min);
  };

  const next = () => {
    const itemsNumber = count ? countNumber() : min;
    const iterMax = Math.min(items.length, itemsNumber + count);

    begin = Date.now();
    for (; count < iterMax; count++) {
      const itemResult = fn(items[count], count);
      if (done) result[count] = itemResult;
    }
    sum += Date.now() - begin;

    if (count < items.length) {
      begin = Date.now();
      setTimeout(next, 0);
    } else if (done) {
      done(null, result);
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
  const len = items.length;

  if (!len) {
    done(null, []);
    return;
  }

  let count = 0;
  let suitable = 0;
  const data = new Array(len);
  const rejected = Symbol('rejected');

  const next = (index, err, accepted) => {
    if (!accepted || err) {
      data[index] = rejected;
    } else {
      data[index] = items[index];
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
      done(null, result);
    }
  };

  for (let i = 0; i < len; i++) {
    fn(items[i], next.bind(null, i));
  }
};

const REDUCE_EMPTY_ARR =
  'Metasync: reduce of empty array with no initial value';

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
  const len = items.length;
  const hasInitial = typeof initial !== 'undefined';

  if (len === 0 && !hasInitial) {
    done(new TypeError(REDUCE_EMPTY_ARR), initial);
    return;
  }

  let previous = hasInitial ? initial : items[0];
  if ((len === 0 && hasInitial) || (len === 1 && !hasInitial)) {
    done(null, previous);
    return;
  }

  let count = hasInitial ? 0 : 1;
  let current = items[count];
  const last = len - 1;

  const next = (err, data) => {
    if (err) {
      done(err);
      return;
    }
    if (count === last) {
      done(null, data);
      return;
    }
    count++;
    previous = data;
    current = items[count];
    fn(previous, current, next, count, items);
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
  const len = items.length;
  const hasInitial = typeof initial !== 'undefined';

  if (len === 0 && !hasInitial) {
    done(new TypeError(REDUCE_RIGHT_EMPTY_ARR), initial);
    return;
  }

  let previous = hasInitial ? initial : items[len - 1];
  if ((len === 0 && hasInitial) || (len === 1 && !hasInitial)) {
    done(null, previous);
    return;
  }

  let count = hasInitial ? len - 1 : len - 2;
  let current = items[count];
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
    current = items[count];
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
  const len = items.length;
  if (len === 0) {
    done(null, items);
    return;
  }
  let count = 0;
  let errored = false;

  const next = err => {
    if (errored) return;
    if (err) {
      errored = true;
      done(err);
      return;
    }
    count++;
    if (count === len) done(null);
  };

  for (let i = 0; i < len; i++) {
    fn(items[i], next);
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
  const len = items.length;
  let i = -1;

  const next = () => {
    i++;
    if (i === len) {
      done(null, items);
      return;
    }
    fn(items[i], err => {
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
  const len = items.length;
  if (len === 0) {
    done();
    return;
  }
  let finished = false;
  const last = len - 1;

  const next = (index, err, accepted) => {
    if (finished) return;
    if (err) {
      finished = true;
      done(err);
      return;
    }
    if (accepted) {
      finished = true;
      done(null, items[index]);
      return;
    }
    if (index === last) done(null);
  };

  for (let i = 0; i < len; i++) {
    fn(items[i], next.bind(null, i));
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
  if (items.length === 0) {
    done(null, true);
    return;
  }
  let proceedItemsCount = 0;
  const len = items.length;

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

  for (const item of items) fn(item, finish);
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
  const len = items.length;
  let i = 0;

  const next = () => {
    if (i === len) {
      done(null, false);
      return;
    }
    fn(items[i], (err, accepted) => {
      if (err) {
        done(err);
        return;
      }
      if (accepted) {
        done(null, true);
        return;
      }
      i++;
      next();
    });
  };

  if (len > 0) next();
  else done(null, false);
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
