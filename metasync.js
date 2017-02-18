'use strict';

const arrayUtils = require('./array-utils');
const AsyncArray = require('./async-array');

const metasync = {};
module.exports = metasync;

Object.assign(metasync, arrayUtils);

metasync.composition = (
  // Functional Asynchronous Composition
  fns, // array of function([data,] callback)
  // data - incoming data
  // callback(data)
  //   data - outgoing data
  done, // callback(data)
  // data - hash with of functions results
  data // incoming data
) => {
  if (fns.length === 1) {
    metasync.parallel(fns[0], done, data);
  } else {
    metasync.sequential(fns, done, data);
  }
};

metasync.parallel = (
  // Parallel execution
  fns, // array of function([data,] callback)
  // data - incoming data
  // callback - function(data)
  //   data - outgoing data
  done, // on done callback(data)
  // data - hash with of functions results
  data = {} // incoming data
) => {
  const len = fns.length;
  let counter = 0;
  let finished = false;

  if (len < 1) {
    if (done) done(data);
    return;
  }
  fns.forEach((fn) => {
    const finish = (result) => {
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
    else if (fn.length === 2) fn(data, finish);
    else fn(finish);
  });
};

metasync.sequential = (
  // Sequential execution
  fns, // array of function([data,] callback)
  // data - incoming data
  // callback - function(data)
  //   data - outgoing data
  done, // on done callback(data)
  // data - hash with of functions results
  data = {} // incoming data
) => {
  let i = -1;
  const len = fns.length;

  function next() {
    let fn = null;
    const finish = (result) => {
      if (fn.name && result) data[fn.name] = result;
      if (result instanceof Error) {
        if (done) done(result);
        return;
      }
      next();
    };
    if (++i >= len) {
      if (done) done(data);
      return;
    }
    fn = fns[i];
    if (Array.isArray(fn)) metasync.composition(fn, finish, data);
    else if (fn.length === 2) fn(data, finish);
    else fn(finish);
  }

  if (len > 0) next();
  else if (done) done(data);
};

metasync.DataCollector = function(
  expected, // number of collect() calls expected
  timeout // collect timeout (optional)
) {
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
  const collector = this;
  if (this.timeout) {
    this.timer = setTimeout(() => {
      const err = new Error('DataCollector timeout');
      collector.emit('timeout', err, collector.data);
    }, timeout);
  }
};

metasync.DataCollector.prototype.collect = function(
  // Push data to collector
  key, // key in result data
  data // value or error instance
) {
  this.count++;
  if (data instanceof Error) {
    this.errs[key] = data;
    this.emit('error', data, key);
  } else {
    this.data[key] = data;
  }
  if (this.expected === this.count) {
    if (this.timer) clearTimeout(this.timer);
    const errs = this.errs.length ? this.errs : null;
    this.emit('done', errs, this.data);
  }
};

metasync.DataCollector.prototype.on = function(
  // DataCollector events:
  eventName,
  callback
  // on('error', function(err, key))
  // on('timeout', function(err, data))
  // on('done', function(errs, data))
  //   errs - hash of errors
  //   data - hash of sucessfully received adta
) {
  if (eventName in this.events) {
    this.events[eventName] = callback;
  }
};

metasync.DataCollector.prototype.emit = function(
  // Emit DataCollector events
  eventName,
  err,
  data
) {
  const event = this.events[eventName];
  if (event) event(err, data);
};

metasync.KeyCollector = function(
  // Key Collector
  keys, // array of keys, example: ['config', 'users', 'cities']
  timeout // collect timeout (optional)
) {
  this.isDone = false;
  this.keys = keys;
  this.expected = keys.length;
  this.count = 0;
  this.timeout = timeout;
  this.data = {};
  this.errs = [];
  this.events = {
    error: null,
    timeout: null,
    done: null
  };
  const collector = this;
  if (this.timeout) {
    this.timer = setTimeout(() => {
      const err = new Error('KeyCollector timeout');
      collector.emit('timeout', err, collector.data);
    }, timeout);
  }
};

metasync.KeyCollector.prototype.collect = function(
  key,
  data
) {
  if (this.keys.includes(key)) {
    this.count++;
    if (data instanceof Error) {
      this.errs[key] = data;
      this.emit('error', data, key);
    } else {
      this.data[key] = data;
    }
    if (this.expected === this.count) {
      if (this.timer) clearTimeout(this.timer);
      const errs = this.errs.length ? this.errs : null;
      this.emit('done', errs, this.data);
    }
  }
};

metasync.KeyCollector.prototype.stop = function() {
};

metasync.KeyCollector.prototype.pause = function() {
};

metasync.KeyCollector.prototype.resume = function() {
};

metasync.KeyCollector.prototype.on = function(
  // KeyCollector events:
  eventName,
  callback
  // on('error', function(err, key))
  // on('timeout', function(err, data))
  // on('done', function(errs, data))
  // on('pause', function())
  // on('resume', function())
) {
  if (eventName in this.events) {
    this.events[eventName] = callback;
  }
};

metasync.KeyCollector.prototype.emit = function(
  // Emit DataCollector events
  eventName,
  err,
  data
) {
  const event = this.events[eventName];
  if (event) event(err, data);
};

metasync.ConcurrentQueue = function(
  // ConcurrentQueue
  concurrency, // number of simultaneous and asynchronously executing tasks
  timeout // process timeout (optional), for single item
) {
  this.isOnPause = false;
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

metasync.ConcurrentQueue.prototype.add = function(
  item // add item to queue
) {
  if (!this.isOnPause) {
    if (this.count < this.concurrency) {
      this.next(item);
    } else {
      this.items.push(item);
    }
  }
};

metasync.ConcurrentQueue.prototype.next = function(
  item // process next item from queue
) {
  const queue = this;
  let timer;
  if (queue.isOnPause) return;
  queue.count++;
  if (queue.timeout) {
    timer = setTimeout(() => {
      const err = new Error('ConcurrentQueue timed out');
      queue.emit('timeout', err);
    }, queue.timeout);
  }
  const stub = (item, callback) => callback();
  const fn = queue.events.process || stub;
  fn(item, () => {
    queue.count--;
    if (queue.timeout) {
      clearTimeout(timer);
    }
    if (queue.items.length > 0) {
      const item = queue.items.shift();
      queue.next(item);
    } else if (queue.count === 0) {
      queue.emit('empty');
    }
  });
};

metasync.ConcurrentQueue.prototype.on = function(
  // ConcurrentQueue events:
  eventName,
  fn
  // on('error', function(err))
  // on('empty', function()) - no more items in queue
  // on('process', function(item, callback)) - process item function
  // on('timeout', function(err, data))
) {
  if (!this.isOnPause && eventName in this.events) {
    this.events[eventName] = fn;
  }
};

metasync.ConcurrentQueue.prototype.emit = function(
  eventName, // event name
  err, // instance of Error
  data // attached data
) {
  if (!this.isOnPause) {
    const event = this.events[eventName];
    if (event) event(err, data);
  }
};

metasync.ConcurrentQueue.prototype.pause = function() {
  this.isOnPause = true;
};

metasync.ConcurrentQueue.prototype.resume = function() {
  this.isOnPause = false;
};

metasync.ConcurrentQueue.prototype.stop = function() {
  this.isOnPause = false;
  this.concurrency = null;
  this.timeout = null;
  this.count = 0;
  this.items = [];
  this.events = {
    error: null,
    timeout: null,
    empty: null,
    process: null
  };
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

metasync.throttle = (
  // Function throttling
  timeout, // time interval
  fn, // function to be executed once per timeout
  args // arguments array for fn (optional)
) => {
  let timer = null;
  let wait = false;
  return function throttled() {
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        if (wait) throttled();
      }, timeout);
      if (args) fn(...args);
      else fn();
      wait = false;
    } else {
      wait = true;
    }
  };
};

metasync.timeout = (
  // Set timeout for function execution
  timeout, // time interval
  asyncFunction, // async function to be executed
  // done - callback function
  doneFunction // callback function on done
) => {
  let finished = false;

  const timer = setTimeout(() => {
    if (!finished) {
      finished = true;
      doneFunction();
    }
  }, timeout);

  asyncFunction(() => {
    if (!finished) {
      clearTimeout(timer);
      finished = true;
      doneFunction();
    }
  });
};

metasync.for = (
  // Create an AsyncArray instance
  array  // an array or a promise that resolves to an array
) => (
  new AsyncArray(array)
);
