'use strict';

const common = require('metarhia-common');

const map = (
  // Asynchronous map (iterate parallel)
  items, // incoming array
  fn, // (current, callback) => callback(err, value)
  // to be executed for each value in the array
  //   current - current element being processed in the array
  //   callback - function(err, value)
  done // optional on done callback function(err, result)
) => {
  const len = items.length;
  const result = new Array(len);
  let errored = false;
  let count = 0;
  done = common.cb(done);
  if (!len) done(null, result);

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

  let i;
  for (i = 0; i < len; i++) {
    fn(items[i], next.bind(null, i));
  }
};

const filter = (
  // Asynchrous filter (iterate parallel)
  items, // incoming array
  fn, // (value, callback) => (err, accepted)
  // to be executed for each value in the array
  //   value - item from items array
  //   callback - function(err, accepted)
  done // optional on done callback function(err, result)
) => {
  const len = items.length;
  let result = [];
  let count = 0;
  let errored = false;
  done = common.cb(done);

  if (!len) done(null, result);

  function finish() {
    // Callbacks might be called in any possible order,
    // hence sort the filtered array
    // by element's index in the original itemsection
    result.sort((x, y) => (x.index - y.index));

    // Only value is needed in resulting array
    result = result.map(x => x.value);

    // Return a result using callback;
    done(null, result);
  }

  const next = (index, err, accepted) => {
    if (errored) return;
    if (err) {
      errored = true;
      done(err);
      return;
    }
    if (accepted) result.push({ index, value: items[index] });
    count++;
    if (count === len) finish();
  };

  let i;
  for (i = 0; i < len; i++) {
    fn(items[i], next.bind(null, i));
  }
};

const reduce = (
  // Asynchronous reduce
  items, // incoming array
  fn, // function to be executed for each value in array
  //   previous - value previously returned in the last iteration
  //   current - current element being processed in the array
  //   callback - callback for returning value back to function reduce
  //   counter - index of the current element being processed in array
  //   items - the array reduce was called upon
  done, // optional on done callback function(err, result)
  initial // optional value to be used as first arpument in first iteration
) => {
  const len = items.length;
  done = common.cb(done);
  let count = typeof(initial) === 'undefined' ? 1 : 0;

  if (!len) {
    if (count) {
      done(new TypeError('Reduce of empty array with no initial value'));
    } else {
      done(null, initial);
    }
    return;
  }

  let previous = count === 1 ? items[0] : initial;
  let current = items[count];

  function response(err, data) {
    if (err) {
      done(err);
      return;
    }
    if (count === len - 1) {
      done(null, data);
      return;
    }
    count++;
    previous = data;
    current = items[count];
    fn(previous, current, response, count, items);
  }

  fn(previous, current, response, count, items);
};

const each = (
  // Asynchronous each (iterate in parallel)
  items, // incoming array
  fn, // (value, callback) => callback(err)
  //   value - item from items array
  //   callback - callback function(err)
  done // optional on done callback function(err)
) => {
  const len = items.length;
  let count = 0;
  let errored = false;
  done = common.cb(done);
  if (len === 0) {
    done(null);
    return;
  }

  const next = (err) => {
    if (errored) return;
    if (err) {
      errored = true;
      done(err);
    } else {
      count++;
      if (count === len) done(null);
    }
  };

  let i;
  for (i = 0; i < len; i++) {
    fn(items[i], next);
  }
};

const series = (
  // Asynchronous series
  items, // incoming array
  fn, // (value, callback) => callback(err)
  //   value - item from items array
  //   callback - callback (err)
  done // optional on done callback (err)
) => {
  const len = items.length;
  let i = -1;
  done = common.cb(done);

  function next() {
    i++;
    if (i === len) {
      done(null);
      return;
    }
    fn(items[i], (err) => {
      if (err) {
        done(err);
        return;
      }
      setImmediate(next);
    });
  }

  next();
};

const find = (
  // Asynchronous find (iterate in series)
  items, // incoming array
  fn, // (value, callback) => callback(err, accepted)
  //   value - item from items array
  //   callback - callback function(err, accepted)
  done // optional on done callback function(err, result)
) => {
  const len = items.length;
  let i = 0;
  done = common.cb(done);

  function next() {
    if (i === len) {
      done(null);
      return;
    }
    fn(items[i], (err, accepted) => {
      if (err) {
        done(err);
        return;
      }
      if (accepted) {
        done(null, items[i]);
        return;
      }
      i++;
      next();
    });
  }

  if (len > 0) next();
  else done(null);
};

const every = (
  // Asynchronous every
  items, // incoming array
  fn, // (value, callback) => callback(err, fits)
  //   value - item from items array
  //   callback - callback function(err, fits)
  done // optional on done callback function(err, result)
) => {
  done = common.cb(done);
  if (items.length === 0) {
    done(null, true);
    return;
  }
  let proceedItemsCount = 0;

  function finish(err, accepted) {
    if (err) {
      done(err);
      return;
    }
    if (!accepted) {
      done(null, false);
      return;
    }

    proceedItemsCount++;
    if (proceedItemsCount === items.length) done(null, true);
  }

  let item;
  for (item of items) {
    fn(item, finish);
  }
};

const some = (
  // Asynchronous some (iterate in series)
  items, // incoming array
  fn, // (value, callback) => (err, accepted)
  //   value - item from items array
  //   callback - callback function(err, accepted)
  done // on done callback function(err, result)
) => {
  const len = items.length;
  let i = 0;
  done = common.cb(done);

  function next() {
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
  }

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
  some
};
