'use strict';

const common = require('@metarhia/common');

function Collector() {}

const COLLECT_TIMEOUT = 'Metasync: Collector timed out';

Collector.prototype.on = function(
  // Collector events
  eventName, // string
  listener // function, handler
  // on('error', function(err, key))
  // on('timeout', function(err, data))
  // on('done', function(errs, data))
) {
  if (eventName in this.events) {
    this.events[eventName] = listener;
  }
};

Collector.prototype.emit = function(
  // Emit Collector events
  eventName, // string
  err, // Error, instance
  data
) {
  const event = this.events[eventName];
  if (event) event(err, data);
};

const DataCollector = function(
  expected, // number, count of `collect()` calls expected
  timeout // number (optional), collect timeout
  // Returns: DataCollector, instance
) {
  this.expected = expected;
  this.timeout = timeout;
  this.count = 0;
  this.data = {};
  this.errs = [];
  this.events = {
    error: null,
    timeout: null,
    done: null,
  };
  if (this.timeout) {
    this.timer = setTimeout(() => {
      const err = new Error(COLLECT_TIMEOUT);
      this.emit('timeout', err, this.data);
    }, timeout);
  }
};

common.inherits(DataCollector, Collector);

DataCollector.prototype.collect = function(
  // Push data to collector
  key, // string, key in result data
  data // value or Error instance
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

const KeyCollector = function(
  // Key Collector
  keys, // array of strings, example: ['config', 'users', 'cities']
  timeout // number (optional), collect timeout
  // Returns: DataCollector, instance
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
    done: null,
  };
  const collector = this;
  if (this.timeout) {
    this.timer = setTimeout(() => {
      const err = new Error(COLLECT_TIMEOUT);
      collector.emit('timeout', err, collector.data);
    }, timeout);
  }
};

common.inherits(KeyCollector, Collector);

KeyCollector.prototype.collect = function(
  key, // string
  data // scalar or object
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

KeyCollector.prototype.stop = function() {
};

KeyCollector.prototype.pause = function() {
};

KeyCollector.prototype.resume = function() {
};

module.exports = { DataCollector, KeyCollector };
