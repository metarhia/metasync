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
//   done - on `done` callback(data)
//
metasync.DataCollector = function(expected, done) {
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

// Asynchrous filter
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

// Asynchronous find
// find :: [a] -> (a -> (Boolean -> Void) -> Void) -> (a -> Void)
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
//       accepted - true/false returned from fn
//   done - on `done` function(result)
//     result - filtered array
//
metasync.series = function(items, fn, done) {
  var i = -1,
      len = items.length;

  function next() {
    i++;
    if (i >= len) {
      if (done) done();
    } else fn(items[i], function(result) {
      if (result instanceof Error) {
        if (done) done(result);
      } else next();
    });
  }

  next();
};

// Asynchronous each
//   items - incoming array
//   fn - function(value, callback)
//     value - item from items array
//     callback - callback function(accepted)
//       accepted - true/false returned from fn
//   done - on `done` function(result)
//     result - filtered array
//
metasync.each = function(items, fn, done) {
  var counter = 0,
      len = items.length,
      finished = false;

  if (len < 1) {
    if (done) done();
  } else {
    items.forEach(function(item) {
      fn(item, function(result) {
        if (result instanceof Error) {
          if (!finished) {
            if (done) done(result);
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
