'use strict';

const metasync = {};
module.exports = metasync;

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
