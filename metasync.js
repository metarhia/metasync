'use strict';

var metasync = {};
module.exports = metasync;

// Functional Asyncronous Composition
//   fns - array of function([data,] callback)
//     data - incoming data
//     callback - function(data)
//       data - outgoing data
//   done - on `done` callback(data)
//     data - hash with of functions results
//   data - incoming data
//
metasync.composition = function(fns, done, data) {
  if (fns.length === 1) {
    metasync.parallel(fns[0], done, data);
  } else {
    metasync.sequential(fns, done, data);
  }
};

// Parallel execution
//   fns - array of function([data,] callback)
//     data - incoming data
//     callback - function(data)
//       data - outgoing data
//   done - on `done` callback(data)
//     data - hash with of functions results
//   data - incoming data
//
metasync.parallel = function(fns, done, data) {
  var counter = 0,
      len = fns.length,
      finished = false;
  data = data || {};

  if (len < 1) {
    if (done) done(data);
  } else {
    fns.forEach(function(fn) {
      var finish = function(result) {
        if (fn.name && result) data[fn.name] = result;
        if (result instanceof Error) {
          if (!finished) {
            if (done) done(result);
          }
          finished = true;
        } else {
          if (++counter >= len) {
            if (done) done(data);
          }
        }
      };
      // fn may be array of function
      if (Array.isArray(fn)) metasync.composition(fn, finish, data);
      else {
        if (fn.length === 2) fn(data, finish);
        else fn(finish);
      }
    });
  }
};

// Sequential execution
//   fns - array of function([data,] callback)
//     data - incoming data
//     callback - function(data)
//       data - outgoing data
//   done - on `done` callback(data)
//     data - hash with of functions results
//   data - incoming data
//
metasync.sequential = function(fns, done, data) {
  var i = -1,
      len = fns.length;
  data = data || {};

  function next() {
    var fn;
    var finish = function finish(result) {
      if (fn.name && result) data[fn.name] = result;
      if (result instanceof Error) {
        if (done) done(result);
      } else next();
    };
    if (++i >= len) {
      if (done) done(data);
    } else {
      fn = fns[i];
      if (Array.isArray(fn)) metasync.composition(fn, finish, data);
      else {
        if (fn.length === 2) fn(data, finish);
        else fn(finish);
      }
    }
  }

  if (len > 0) next();
  else if (done) done(data);
};

// Data Collector
//   expected - number of `collect()` calls expected
//   timeout
//   done - on `done` callback(err, data)
//
metasync.DataCollector = function(expected, timeout, done) {
  this.expected = expected;
  this.data = {};
  this.count = 0;
  this.done = done;
};

// Push data to collector
//   key - key in result data
//   data - value in result data
//
metasync.DataCollector.prototype.collect = function(key, data) {
  this.count++;
  this.data[key] = data;
  if (this.expected === this.count) this.done(this.data);
};

// Key Collector
//   ecpected - array of keys, example: ['config', 'users', 'cities']
//   done - callback(err, data)
//     data - hash {config, users, cities}

metasync.KeyCollector = function(expected, timeout, done) {
  thist.isDone = false;
};

metasync.KeyCollector.prototype.collect = function(key, data) {
};

metasync.KeyCollector.prototype.stop = function(isDone) {
};

metasync.KeyCollector.prototype.pause = function() {
};

metasync.KeyCollector.prototype.resume = function() {
};

metasync.KeyCollector.prototype.on = function(eventName, callback) {
  // eventName:
  //   .on('callect', ...)
  //   .on('done', ...)
  //   .on('pause', ...)
  //   .on('resume', ...)
  //   .on('error', ...)
  //   .on('timeout', ...)
};

metasync.ConcurrentQueue = function(concurrency) {
};

metasync.ConcurrentQueue.prototype.add = function(item) {
};

metasync.ConcurrentQueue.prototype.on = function(eventName, fn) {
  // eventName:
  //   .on('empty', ...)
  //   .on('process', ...)
};

metasync.ConcurrentQueue.prototype.pause = function() {
};

metasync.ConcurrentQueue.prototype.resume = function() {
};

metasync.ConcurrentQueue.prototype.stop = function() {
};

metasync.ConcurrentQueue.prototype.free = function() {
};

// Asynchrous filter (iterate parallel)
// filter :: [a] -> (a -> (Boolean -> Void) -> Void) -> ([a] -> Void)
//
// Arguments:
//   items - incoming array
//   fn - function(value, callback)
//     value - item from items array
//     callback - callback function(accepted)
//       accepted - true/false returned from fn
//   done - on `done` function(result)
//     result - filtered array
//
metasync.filter = function(items, fn, done) {
  var result = [],
      counter = 0;

  function finish() {
    // Callbacks might be called in any possible order,
    // hence sort the filtered array
    // by element's index in the original itemsection
    result.sort(function(x, y) { return x.index - y.index; });

    // Only value is needed in resulting array
    result = result.map(function(x) { return x.value; });

    // Return a result using callback;
    if (done) done(result);
  }

  items.forEach(function(value, index) {
    fn(value, function(accepted) {
      if (accepted) result.push({ index: index, value: value });
      if (++counter === items.length) finish();
    });
  });
};

// Asynchronous find (iterate in series)
// find :: [a] -> (a -> (Boolean -> Void) -> Void) -> (a -> Void)
//
// Arguments:
//   items - incoming array
//   fn - function(value, callback)
//     value - item from items array
//     callback - callback function(accepted)
//       accepted - true/false returned from fn
//   done - on `done` function(result)
//     result - found item
//
metasync.find = function(items, fn, done) {
  var i = 0,
      len = items.length;

  function next() {
    if (i === len) {
      if (done) done();
    } else {
      fn(items[i], function(accepted) {
        if (accepted) {
          if (done) done(items[i]);
        } else {
          i++;
          next();
        }
      });
    }
  }

  if (len > 0) next();
  else if (done) done();
};

// Asynchronous series
//   items - incoming array
//   fn - function(value, callback)
//     value - item from items array
//     callback - callback function(accepted)
//       err - instance of Error or null
//   done - on `done` function(result)
//     err - instance of Error or null
//
metasync.series = function(items, fn, done) {
  var i = -1,
      len = items.length;

  function next() {
    i++;
    if (i >= len) {
      if (done) done();
    } else fn(items[i], function(err) {
      if (err instanceof Error) {
        if (done) done(err);
      } else next();
    });
  }

  next();
};

// Asynchronous each (iterate in parallel)
//   items - incoming array
//   fn - function(value, callback)
//     value - item from items array
//     callback - callback function(accepted)
//       err - instance of Error or null
//   done - on `done` function(result)
//     err - instance of Error or null
//
metasync.each = function(items, fn, done) {
  var counter = 0,
      len = items.length,
      finished = false;

  if (len < 1) {
    if (done) done();
  } else {
    items.forEach(function(item) {
      fn(item, function(err) {
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
  }
};

// Asyncronous reduce
//   items - incoming array
//   callback - function to be executed for each value in the array
//     previous - value previously returned in the last iteration
//     current - current element being processed in the array
//     callback - callback for returning value back to function reduce
//     counter - the index of the current element being processed in the array
//     items - the array reduce was called upon
//   done - callback function on done
//     err - error or null
//     data - result if !err
//   initial - optional value to be used as first arpument in first iteration
//
metasync.reduce = function(items, callback, done, initial) {
  var counter = typeof(initial) === 'undefined' ? 1 : 0,
      previous = counter === 1 ? items[0] : initial,
      current = items[counter];

  function response(err, data) {
    if (!err && counter !== items.length - 1) {
      counter++;
      previous = data;
      current = items[counter];
      callback(previous, current, response, counter, items);
    } else {
      if (done) done(err, data);
    }
  }

  callback(previous, current, response, counter, items);
};

// Asyncronous map
//   items - incoming array
//   callback - function to be executed for each value in the array
//     current - current element being processed in the array
//     callback - callback for returning value back to function map
//   done - callback function on done
//     err - error or null
//     data - result if !err
//
metasync.map = function(items, callback, done) {
};
