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
    done = api.metasync.cb(done);

    if (!len) done(null, result);

    const addUpdatingResult = (fn, i) => (
      api.metasync.monad.asAsync(fn, items[i])
         .fmap(newEl => result[i] = newEl)
    );

    const fns = api.common.range(0, len - 1)
                   .map(i => addUpdatingResult(fn, i));
    api.metasync.monad.asAsync(api.metasync.parallel, fns)
       .fmap(() => result)(done);
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
    done = api.metasync.cb(done);

    const finish = (acceptedArr) => {
      let count = 0;
      let i;
      for (i = 0; i < len; i++) {
        if (acceptedArr[i]) count++;
      }
      const result = new Array(count);
      let j;
      for (i = 0, j = 0; i < len; i++) {
        if (acceptedArr[i]) {
          result[j] = items[i];
          j++;
        }
      }
      return result;
    };

    api.metasync.monad.asAsync(api.metasync.map, items, fn)
       .fmap(finish)(done);
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
