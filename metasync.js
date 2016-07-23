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

  if (len > 0) {
    funcs.forEach(function(func) {
      if (Array.isArray(func)) metasync.composition(func, finish);
      else func(finish);
    });
  } else done();

  function finish(result) {
    if (result instanceof Error) {
      if (!finished) done(result);
      finished = true;
    } else {
      counter++;
      if (counter >= len) done();
    }
  }
};

metasync.sequential = function(funcs, done) {
  var i = -1,
      len = funcs.length;

  function next() {
    i++;
    if (i >= len) done();
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
