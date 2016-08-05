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
  this.data[key] = data;
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

  if ((len < 1) && done) done();
  else {
    funcs.forEach(function(func) {
      if (Array.isArray(func)) metasync.composition(func, finish);
      else func(finish);
    });
  }

  function finish(result) {
    if (result instanceof Error) {
      if (!finished && done) done(result);
      finished = true;
    } else {
      if ((++counter >= len) && done) done();
    }
  }
};

metasync.sequential = function(funcs, done) {
  var i = -1,
      len = funcs.length;

  function next() {
    if ((++i >= len) && done) done();
    else {
      var func = funcs[i];
      if (Array.isArray(func)) metasync.composition(func, finish);
      else func(finish);
    }
  }

  function finish(result) {
    if ((result instanceof Error) && done) done(result);
    else next();
  }

  if (len > 0) next();
  else if (done) done();
};

// Asynchrous filter

// filter :: [a] -> (a -> (Boolean -> Void) -> Void) -> ([a] -> Void)
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
metasync.find = function(items, fn, done) {
  var i = 0,
      len = items.length;

  function next() {
    if ((i === len) && done) done();
    else {
      fn(items[i], function(accepted) {
        if (accepted && done) done(items[i]);
        else {
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

metasync.series = function(items, fn, done) {
  var i = -1,
      len = items.length;

  function next() {
    i++;
    if ((i >= len) && done) done();
    else fn(items[i], function(result) {
      if ((result instanceof Error) && done) done(result);
      else next();
    });
  }

  next();
};

// Asynchronous each

metasync.each = function(items, fn, done) {
  var counter = 0,
      len = items.length,
      finished = false;

  if (len < 1) done();
  else {
    items.forEach(function(item) {
      fn(item, function(result) {
        if (result instanceof Error) {
          if (!finished && done) done(result);
          finished = true;
        } else {
          counter++;
          if ((counter >= len) && done) done();
        }
      });
    });
  }
};
