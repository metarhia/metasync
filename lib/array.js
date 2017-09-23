'use strict';

const common = require('metarhia-common');

const map = (
  // Asynchronous map (iterate parallel)
  items, // array, incoming
  fn, // function, (current, callback) => callback(err, value)
  //   to be executed for each value in the array
  //   current - current element being processed in the array
  //   callback - function(err, value)
  done // function (optional), on done callback function(err, result)
) => {
  const len = items.length;
  done = common.once(done);
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

  let i;
  for (i = 0; i < len; i++) {
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
  const len = items.length;
  done = common.once(done);

  if (!len) {
    done(null, []);
    return;
  }

  let finished = false;
  let count = 0;
  let position = 0;
  const result = new Array(len);

  const next = (index, err, accepted) => {
    if (finished) return;
    if (err) {
      finished = true;
      done(err);
      return;
    }
    position++;
    if (accepted) result[count++] = items[index];
    if (position === len) {
      finished = true;
      done(null, result.slice(0, count));
    }
  };

  let i;
  for (i = 0; i < len; i++) {
    fn(items[i], next.bind(null, i));
  }
};

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
  const len = items.length;
  done = common.once(done);
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
  items, // array, incoming
  fn, // function, (value, callback) => callback(err)
  //   value - item from items array
  //   callback - callback function(err)
  done // function (optional), on done callback function(err, items)
) => {
  const len = items.length;
  done = common.once(done);
  if (len === 0) {
    done(null, items);
    return;
  }
  let count = 0;
  let errored = false;

  const next = (err) => {
    if (errored) return;
    if (err) {
      errored = true;
      done(err);
      return;
    }
    count++;
    if (count === len) done(null);
  };

  let i;
  for (i = 0; i < len; i++) {
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
  const len = items.length;
  let i = -1;
  done = common.once(done);

  function next() {
    i++;
    if (i === len) {
      done(null, items);
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
  items, // array, incoming
  fn, // (value, callback) => callback(err, accepted)
  //   value - item from items array
  //   callback - callback function(err, accepted)
  done // function (optional), on done callback function(err, result)
) => {
  const len = items.length;
  done = common.once(done);
  if (len === 0) {
    done();
    return;
  }
  let finished = false;
  const last = len - 1;

  const next = (index, err, accepted) => {
    //console.dir({ index, err, accepted, item: items[index] });
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

  let i;
  for (i = 0; i < len; i++) {
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
  done = common.once(done);
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
  items, // array, incoming
  fn, // function, (value, callback) => (err, accepted)
  //   value - item from items array
  //   callback - callback function(err, accepted)
  done // function, on done callback function(err, result)
) => {
  const len = items.length;
  let i = 0;
  done = common.once(done);

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
