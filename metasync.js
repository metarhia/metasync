'use strict';

var metasync = {};
module.exports = metasync;

// Data Collector

metasync.DataCollector = function(expected, done) {
  this.expected = expected;
  this.data = {};
  this.count = 0;
  this.done = done;
};

metasync.DataCollector.prototype.collect = function(key, data) {
  this.count++;
  this.data[key] = data;;
  if (this.expected === this.count) this.done(this.data);
};

// Functional Asyncronous Composition

metasync.composition = function(funcs, done) {
  if (funcs.length === 1) {
    metasync.parallel(funcs[0], done);
  } else {
    metasync.sequential(funcs, done);
  }
};

metasync.parallel = function(funcs, done) {
  var counter = 0,
      len = funcs.length,
      finished = false;

  if (len < 1) done();
  else {
    funcs.forEach(function(func) {
      if (Array.isArray(func)) metasync.composition(func, finish);
      else func(finish);
    });
  }

  function finish(result) {
    if (result instanceof Error) {
      if (!finished) done(result);
      finished = true;
    } else {
      if (++counter >= len) done();
    }
  }
};

metasync.sequential = function(funcs, done) {
  var i = -1,
      len = funcs.length;

  function next() {
    if (++i >= len) done();
    else {
      var func = funcs[i];
      if (Array.isArray(func)) metasync.composition(func, finish);
      else func(finish);
    }
  }

  function finish(result) {
    if (result instanceof Error) done(result);
    else next();
  }

  if (len > 0) next();
  else done();
};

// Asynchrous filter

// filter :: [a] -> (a -> (Boolean -> Void) -> Void) -> ([a] -> Void)
metasync.filter = function(coll, predicate, done) {
  var result = [],
      counter = 0;

  function finish() {
    // Callbacks might be called in any possible order,
    // hence sort the filtered array
    // by element's index in the original collection
    result.sort(function(x, y) { return x.index - y.index; });

    // Only value is needed in resulting array
    result = result.map(function(x) { return x.value; });

    // Return a result using callback;
    done(result);
  }

  coll.forEach(function(value, index) {
    predicate(value, function(accepted) {
      if (accepted) result.push({ index: index, value: value });
      if (++counter === coll.length) finish();
    });
  });
};
