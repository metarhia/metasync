'use strict';

const metasync = {};
module.exports = metasync;

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
