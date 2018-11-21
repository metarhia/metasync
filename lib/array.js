'use strict';

const common = require('@metarhia/common');

const map = (
  // Asynchronous map (iterate parallel)
  items, // array, incoming
  fn, // function, (current, callback) => callback(err, value)
  //   to be executed for each value in the array
  //   current - current element being processed in the array
  //   callback - function(err, value)
  done // function (optional), on done callback function(err, result)
) => {
  done = done || common.emptyness;
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

const filter = (
  // Asynchrous filter (iterate parallel)
  items, // array, incoming
  fn, // function, (value, callback) => (err, accepted)
  //    to be executed for each value in the array
  //    value - item from items array
  //    callback - function(err, accepted)
  done // optional on done callback function(err, result)
) => {
  done = done || common.emptyness;
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

const EMPTY_ARR = 'Metasync: reduce of empty array with no initial value';

const reduce = (
  // Asynchronous reduce
  items, // array, incoming
  fn, // function, to be executed for each value in array
  //   previous - value previously returned in the last iteration
  //   current - current element being processed in the array
  //   callback - callback for returning value back to function reduce
  //   counter - index of the current element being processed in array
  //   items - the array reduce was called upon
  done, // function (optional), on done callback function(err, result)
  initial // optional value to be used as first arpument in first iteration
) => {
  done = done || common.emptyness;
  const len = items.length;
  let count = typeof initial === 'undefined' ? 1 : 0;

  if (!len) {
    const err = count ? new TypeError(EMPTY_ARR) : null;
    done(err, initial);
    return;
  }

  let previous = count === 1 ? items[0] : initial;
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

const each = (
  // Asynchronous each (iterate in parallel)
  items, // array, incoming
  fn, // function, (value, callback) => callback(err)
  //   value - item from items array
  //   callback - callback function(err)
  done // function (optional), on done callback function(err, items)
) => {
  done = done || common.emptyness;
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

const series = (
  // Asynchronous series
  items, // array, incoming
  fn, // function, (value, callback) => callback(err)
  //   value - item from items array
  //   callback - callback (err)
  done // function (optional), on done callback (err, items)
) => {
  done = done || common.emptyness;
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

const find = (
  // Asynchronous find (iterate in series)
  items, // array, incoming
  fn, // (value, callback) => callback(err, accepted)
  //   value - item from items array
  //   callback - callback function(err, accepted)
  done // function (optional), on done callback function(err, result)
) => {
  done = done || common.emptyness;
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

const every = (
  // Asynchronous every
  items, // array, incoming
  fn, // function, (value, callback) => callback(err, fits)
  //   value - item from items array
  //   callback - callback function(err, fits)
  done // function, optional on done callback function(err, result)
) => {
  done = done || common.emptyness;
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

const some = (
  // Asynchronous some (iterate in series)
  items, // array, incoming
  fn, // function, (value, callback) => (err, accepted)
  //   value - item from items array
  //   callback - callback function(err, accepted)
  done // function, on done callback function(err, result)
) => {
  done = done || common.emptyness;
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
  each,
  series,
  find,
  every,
  some,
};
