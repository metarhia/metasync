'use strict';

const common = require('@metarhia/common');

function Collector() {}

const COLLECT_TIMEOUT = 'Metasync: Collector timed out';

// Add event listener
//   eventName - <string>
//   listener - <Function>, handler
//
// Example:
// const collector = new Collector();
// collector.on('error', (err, key) => { ... });
// collector.on('timeout', (err, data) => { ... });
// collector.on('done', (errs, data) => { ... })
Collector.prototype.on = function (eventName, listener) {
  if (eventName in this.events) {
    this.events[eventName] = listener;
  }
};

// Emit Collector events
//   eventName - <string>
//   err - <Error> | <null>
Collector.prototype.emit = function (eventName, err, data) {
  const event = this.events[eventName];
  if (event) event(err, data);
};

// Create new DataCollector
// Signature: expected[, timeout]
//   expected - <number>, count of `collect()` calls expected
//   timeout - <number>, collect timeout, optional
//
// Returns: <DataCollector>
const DataCollector = function (expected, timeout) {
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

// Push data to collector
//   key - <string>, key in result data
//   data - <Object> | <Error>, value or error
DataCollector.prototype.collect = function (key, data) {
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

// Key Collector
// Signature: keys[, timeout]
//   keys - <string[]>
//   timeout - <number>, collect timeout, optional
//
// Returns: <DataCollector>
//
// Example: new KeyCollector(['config', 'users', 'cities'])
const KeyCollector = function (keys, timeout) {
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
// Collect keys and data
//   key - <string>
//   data - <scalar> | <Object> | <Error>, value or error
KeyCollector.prototype.collect = function (key, data) {
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

KeyCollector.prototype.stop = function () {};

KeyCollector.prototype.pause = function () {};

KeyCollector.prototype.resume = function () {};

module.exports = { DataCollector, KeyCollector };
