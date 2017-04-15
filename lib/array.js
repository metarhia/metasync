'use strict';

module.exports = (api) => {

  api.metasync.map = (
    // Asynchronous map (iterate parallel)
    items, // incoming array
    fn, // function(current, callback)
    // to be executed for each value in the array
    //   current - current element being processed in the array
    //   callback - function(err, accepted)
    //     err - error or null
    //     value - mapped item
    done // optional on done callback function(err, result)
    //   err - error or null
    //   result - array result
  ) => {
    const len = items.length;
    const result = new Array(len);
    let errored = false;
    let count = 0;
    done = api.metasync.cb(done);

    if (!len) done(null, result);

    const next = (index, err, value) => {
      if (errored) return;
      if (err) {
        errored = true;
        return done(err);
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

  api.metasync.filter = (
    // Asynchrous filter (iterate parallel)
    items, // incoming array
    fn, // function(value, callback)
    // to be executed for each value in the array
    //   value - item from items array
    //   callback - function(err, accepted)
    //     err - error or null
    //     accepted - filtering result true/false
    done // optional on done callback function(err, result)
    //   err - error or null
    //   result - array result
  ) => {
    const len = items.length;
    let result = [];
    let count = 0;
    let errored = false;
    done = api.metasync.cb(done);

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
        return done(err);
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

  api.metasync.reduce = (
    // Asynchronous reduce
    items, //   items - incoming array
    callback, // callback - function to be executed for each value in array
    //     previous - value previously returned in the last iteration
    //     current - current element being processed in the array
    //     callback - callback for returning value back to function reduce
    //     counter - index of the current element being processed in array
    //     items - the array reduce was called upon
    done, // optional on done callback function(err, result)
    //   err - error or null
    //   result - array result
    initial // optional value to be used as first arpument in first iteration
  ) => {
    const len = items.length;
    done = api.metasync.cb(done);

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
      if (err) return done(err);
      if (count === len - 1) return done(null, data);
      count++;
      previous = data;
      current = items[count];
      callback(previous, current, response, count, items);
    }

    callback(previous, current, response, count, items);
  };

  api.metasync.each = (
    // Asynchronous each (iterate in parallel)
    items, // incoming array
    fn, // function(value, callback)
    // value - item from items array
    // callback - callback function(accepted)
    //   err - instance of Error or null
    done // optional on done callback function(err)
    //   err - error or null
  ) => {
    const len = items.length;
    let count = 0;
    let errored = false;
    done = api.metasync.cb(done);

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

    if (len < 1) return done(null);
    let i;
    for (i = 0; i < len; i++) {
      fn(items[i], next);
    }
  };

  api.metasync.series = (
    // Asynchronous series
    items, // incoming array
    fn, // function(value, callback)
    // value - item from items array
    // callback - callback function(accepted)
    //   err - instance of Error or null
    done // optional on done callback function(err)
    //   err - error or null
  ) => {
    const len = items.length;
    let i = -1;
    done = api.metasync.cb(done);

    function next() {
      i++;
      if (i >= len) return done(null);
      fn(items[i], (err) => {
        if (err) return done(err);
        setImmediate(next);
      });
    }

    next();
  };

  api.metasync.find = (
    // Asynchronous find (iterate in series)
    items, // incoming array
    fn, // function(value, callback)
    //   value - item from items array
    //   callback - function(err, accepted)
    //     err - error or null
    //     accepted - true/false returned from fn
    done // optional on done callback function(err, result)
    //   err - error or null
    //   result - array result
  ) => {
    const len = items.length;
    let i = 0;
    done = api.metasync.cb(done);

    function next() {
      if (i === len) return done(null);
      fn(items[i], (err, accepted) => {
        if (err) return done(err);
        if (accepted) return done(null, items[i]);
        i++;
        next();
      });
    }

    if (len > 0) next();
    else done(null);
  };

  api.metasync.every = (
    // Asynchronous every
    items, //incoming array
    fn, // function(value, callback)
    //   value - item from items array
    //   callback - function(err, fits)
    //     err - error or null
    //     fits - true/false returned from fn
    done // optional on done callback function(err, result)
    //   err - error or null
    //   result - true/false, does every element of array fit predicate
  ) => {
    done = api.metasync.cb(done);

    if (items.length < 1) return done(null, true);

    let proceedItemsCount = 0;

    function finish(err, accepted) {
      if (err) return done(err);
      if (!accepted) return done(null, false);

      proceedItemsCount++;
      if (proceedItemsCount === items.length) done(null, true);
    }

    let item;
    for (item of items) {
      fn(item, finish);
    }
  };

  api.metasync.some = (
    // Asynchronous some (iterate in series)
    items, // incoming array
    fn, // function(value, callback)
    //   value - item from items array
    //   callback - function(err, accepted)
    //     err - error or null
    //     accepted - true/false returned from fn
    done // on done callback function(err, result)
    //   err - error or null
    //   result - true/false
  ) => {
    const len = items.length;
    let i = 0;
    done = api.metasync.cb(done);

    function next() {
      if (i === len) return done(null, false);
      fn(items[i], (err, accepted) => {
        if (err) return done(err);
        if (accepted) return done(null, true);
        i++;
        next();
      });
    }

    if (len > 0) next();
    else done(null, false);
  };
};
