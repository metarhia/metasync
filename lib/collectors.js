'use strict';

module.exports = (api) => {

  api.metasync.collect = (expected) => {

    const isCount = typeof(expected) === 'number';
    const isKeys = Array.isArray(expected);
    if (!(isCount || isKeys)) throw new Error('Unexpected type');
    let keys = null;
    if (isKeys) {
      keys = new Set(expected);
      expected = expected.length;
    }
    let count = 0;
    let timer = null;
    let done = null;
    const data = {};

    const collector = (key, value) => {
      if (isCount || keys.has(key)) count++;
      if (value instanceof Error) return done(value, data);
      data[key] = value;
      if (expected === count) {
        if (timer) clearTimeout(timer);
        done(null, data);
      }
      return collector;
    };

    collector.timeout = (msec) => {
      if (msec) {
        timer = setTimeout(() => {
          const err = new Error('Collector timeout');
          done(err, data);
        }, msec);
        timer.unref();
      }
      return collector;
    };

    collector.done = (cb) => {
      done = cb;
      return collector;
    };

    return collector;

  };

  function Collector() {}

  Collector.prototype.on = function(
    // Collector events:
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

  Collector.prototype.emit = function(
    // Emit Collector events
    eventName, err, data
  ) {
    const event = this.events[eventName];
    if (event) event(err, data);
  };

  api.metasync.DataCollector = function(
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

  api.util.inherits(api.metasync.DataCollector, Collector);

  api.metasync.DataCollector.prototype.collect = function(
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

  api.metasync.KeyCollector = function(
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

  api.util.inherits(api.metasync.KeyCollector, Collector);

  api.metasync.KeyCollector.prototype.collect = function(
    key, data
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

  api.metasync.KeyCollector.prototype.stop = function() {
  };

  api.metasync.KeyCollector.prototype.pause = function() {
  };

  api.metasync.KeyCollector.prototype.resume = function() {
  };
};
