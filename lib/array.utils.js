'use strict';

const metasync = {};
module.exports = metasync;

metasync.map = (
  // Asynchronous map
  items, // incoming array
  callback, // function to be executed for each value in the array
  // current - current element being processed in the array
  // callback - callback for returning value back to function map
  //   err - error or null
  //   value - result
  done // callback function on done
  // err - error or null
  // data - result if !err
) => {
  const result = [];
  let hadError = false;
  let count = 0;
  items.forEach((item, index) => {
    callback(item, (err, value) => {
      if (err) {
        hadError = true;
        return done(err);
      }
      if (hadError) return;
      result[index] = value;
      if (++count === items.length) {
        done(null, result);
      }
    });
  });
};

metasync.filter = (
  // Asynchrous filter (iterate parallel)
  // filter :: [a] -> (a -> (Boolean -> Void) -> Void) -> ([a] -> Void)
  items, // incoming array
  fn, // function(value, callback)
  // value - item from items array
  // callback - callback function(accepted)
  //   accepted - true/false returned from fn
  done // on done function(result)
  // result - filtered array
) => {
  let result = [];
  let counter = 0;

  function finish() {
    // Callbacks might be called in any possible order,
    // hence sort the filtered array
    // by element's index in the original itemsection
    result.sort((x, y) => x.index - y.index);

    // Only value is needed in resulting array
    result = result.map(x => x.value);

    // Return a result using callback;
    if (done) done(result);
  }

  items.forEach((value, index) => {
    fn(value, (accepted) => {
      if (accepted) result.push({ index, value });
      if (++counter === items.length) finish();
    });
  });
};

metasync.reduce = (
  // Asynchronous reduce
  items, //   items - incoming array
  callback, //   callback - function to be executed for each value in the array
  //     previous - value previously returned in the last iteration
  //     current - current element being processed in the array
  //     callback - callback for returning value back to function reduce
  //     counter - the index of the current element being processed in the array
  //     items - the array reduce was called upon
  done, //   done - callback function on done
  //     err - error or null
  //     data - result if !err
  initial // optional value to be used as first arpument in first iteration
) => {
  let counter = typeof(initial) === 'undefined' ? 1 : 0;
  let previous = counter === 1 ? items[0] : initial;
  let current = items[counter];

  function response(err, data) {
    if (err || counter === items.length - 1) {
      if (done) done(err, data);
      return;
    }
    counter++;
    previous = data;
    current = items[counter];
    callback(previous, current, response, counter, items);
  }

  callback(previous, current, response, counter, items);
};

metasync.each = (
  // Asynchronous each (iterate in parallel)
  items, // incoming array
  fn, // function(value, callback)
  // value - item from items array
  // callback - callback function(accepted)
  //   err - instance of Error or null
  done // on `done` function(result)
  // err - instance of Error or null
) => {
  let counter = 0;
  let finished = false;
  const len = items.length;

  if (len < 1) {
    if (done) done();
    return;
  }
  items.forEach((item) => {
    fn(item, (err) => {
      if (err instanceof Error) {
        if (!finished) {
          if (done) done(err);
        }
        finished = true;
      } else {
        counter++;
        if (counter >= len) {
          if (done) done();
        }
      }
    });
  });
};

metasync.series = (
  // Asynchronous series
  items, // incoming array
  fn, // function(value, callback)
  // value - item from items array
  // callback - callback function(accepted)
  //   err - instance of Error or null
  done // on done function(result)
  // err - instance of Error or null
) => {
  let i = -1;
  const len = items.length;

  function next() {
    i++;
    if (i >= len) {
      if (done) done();
      return;
    }
    fn(items[i], (err) => {
      if (err instanceof Error) {
        if (done) done(err);
        return;
      }
      setImmediate(next);
    });
  }

  next();
};

metasync.find = (
  // Asynchronous find (iterate in series)
  // find :: [a] -> (a -> (Boolean -> Void) -> Void) -> (a -> Void)
  items, // incoming array
  fn, // function(value, callback)
  // value - item from items array
  // callback - callback function(accepted)
  //   accepted - true/false returned from fn
  done // on done function(result)
  // result - found item
) => {
  let i = 0;
  const len = items.length;

  function next() {
    if (i === len) {
      if (done) done();
      return;
    }
    fn(items[i], (accepted) => {
      if (accepted) {
        if (done) done(items[i]);
        return;
      }
      i++;
      next();
    });
  }

  if (len > 0) next();
  else if (done) done();
};
