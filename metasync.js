'use strict';

var metasync = {};
module.exports = metasync;

// Functional Asynchronous Composition
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
        } else if (++counter >= len) {
          if (done) done(data);
        }
      };
      // fn may be array of function
      if (Array.isArray(fn)) metasync.composition(fn, finish, data);
      else if (fn.length === 2) {
        fn(data, finish);
      } else {
        fn(finish);
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
      else if (fn.length === 2) {
        fn(data, finish);
      } else {
        fn(finish);
      }
    }
  }

  if (len > 0) next();
  else if (done) done(data);
};

// Data Collector
//   expected - number of collect() calls expected
//   timeout - collect timeout (optional)
//
metasync.DataCollector = function(expected, timeout) {
  this.expected = expected;
  this.timeout = timeout;
  this.count = 0;
  this.data = {};
  this.errs = [];
  this.events = {
    error: null,
    timeout: null,
    done: null
  };
  var collector = this;
  if (this.timeout) {
    this.timer = setTimeout(function() {
      var err = new Error('DataCollector timeout');
      collector.emit('timeout', err, collector.data);
    }, timeout);
  }
};

// Push data to collector
//   key - key in result data
//   data - value or error instance
//
metasync.DataCollector.prototype.collect = function(key, data) {
  this.count++;
  if (data instanceof Error) {
    this.errs[key] = data;
    this.emit('error', data, key);
  } else {
    this.data[key] = data;
  }
  if (this.expected === this.count) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    var errs = this.errs.length ? this.errs : null;
    this.emit('done', errs, this.data);
  }
};

// DataCollector events:
//   on('error', function(err, key))
//   on('timeout', function(err, data))
//   on('done', function(errs, data))
//     errs - hash of errors
//     data - hash of sucessfully received adta
//
metasync.DataCollector.prototype.on = function(eventName, callback) {
  if (eventName in this.events) {
    this.events[eventName] = callback;
  }
};

// Emit DataCollector events
//
metasync.DataCollector.prototype.emit = function(eventName, err, data) {
  var event = this.events[eventName];
  if (event) event(err, data);
};

// Key Collector
//   expected - array of keys, example: ['config', 'users', 'cities']
//   timeout - collect timeout (optional)
//
metasync.KeyCollector = function(expected, timeout) {
  this.isDone = false;
};

metasync.KeyCollector.prototype.collect = function(key, data) {
};

metasync.KeyCollector.prototype.stop = function(isDone) {
};

metasync.KeyCollector.prototype.pause = function() {
};

metasync.KeyCollector.prototype.resume = function() {
};

// KeyCollector events:
//   on('error', function(err, key))
//   on('timeout', function(err, data))
//   on('done', function(errs, data))
//   on('pause', function())
//   on('resume', function())
//
metasync.KeyCollector.prototype.on = function(eventName, callback) {
  if (eventName in this.events) {
    this.events[eventName] = callback;
  }
};

// ConcurrentQueue
//   concurrency - number of simultaneous and asynchronously executing tasks
//   timeout - process timeout (optional), for single item
//
metasync.ConcurrentQueue = function(concurrency, timeout) {
  this.concurrency = concurrency;
  this.timeout = timeout;
  this.count = 0;
  this.items = [];
  this.events = {
    error: null,
    timeout: null,
    empty: null,
    process: null
  };
};

// Add item to queue
//
metasync.ConcurrentQueue.prototype.add = function(item) {
  if (this.count < this.concurrency) {
    this.next(item);
  } else {
    this.items.push(item);
  }
};

// Get next item from queue
//
metasync.ConcurrentQueue.prototype.next = function(item) {
  var queue = this;
  queue.count++;
  if (queue.timeout) {
    var timer = setTimeout(function() {
      var err = new Error('ConcurrentQueue timed out');
      queue.emit('timeout', err);
    }, queue.timeout);
  }
  var fn = queue.events.process || function(item, callback) {
    callback();
  };
  fn(item, function() {
    queue.count--;
    if (queue.timeout) {
      clearTimeout(timer);
    }
    if (queue.items.length > 0) {
      var item = queue.items.shift();
      queue.next(item);
    } else if (queue.count === 0) {
      queue.emit('empty');
    }
  });
};

// ConcurrentQueue events:
//   on('error', function(err))
//   on('empty', function()) - no more items in queue
//   on('process', function(item, callback)) - process item function
//   on('timeout', function(err, data))
//
metasync.ConcurrentQueue.prototype.on = function(eventName, fn) {
  if (eventName in this.events) {
    this.events[eventName] = fn;
  }
};

// Emit DataCollector events
//
metasync.ConcurrentQueue.prototype.emit = function(eventName, err, data) {
  var event = this.events[eventName];
  if (event) event(err, data);
};

metasync.ConcurrentQueue.prototype.pause = function() {
};

metasync.ConcurrentQueue.prototype.resume = function() {
};

metasync.ConcurrentQueue.prototype.stop = function() {
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

// Asynchronous reduce
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
    } else if (done) {
      done(err, data);
    }
  }

  callback(previous, current, response, counter, items);
};

// Asynchronous map
//   items - incoming array
//   callback - function to be executed for each value in the array
//     current - current element being processed in the array
//     callback - callback for returning value back to function map
//       err - error or null
//       value - result
//   done - callback function on done
//     err - error or null
//     data - result if !err
//
metasync.map = function(items, callback, done) {
  var result = [];
  var hadError = false;
  var count = 0;
  items.forEach(function(item, index) {
    callback(item, function(err, value) {
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

// Function throttling
//   timeout - time interval
//   fn - function to be executed once per timeout
//   args - arguments array for fn (optional)
//
metasync.throttle = function(timeout, fn, args) {
  var timer = null;
  var wait = false;
  return function throttled() {
    if (!timer) {
      timer = setTimeout(function() {
        timer = null;
        if (wait) throttled();
      }, timeout);
      if (args) fn.apply(null, args);
      else fn();
      wait = false;
    } else {
      wait = true;
    }
  };
};
