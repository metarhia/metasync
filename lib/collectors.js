'use strict';

module.exports = (api) => {

  api.metasync.collect = (
    expected // count or array of string
    // returns: collector functor
  ) => {
    const isCount = typeof(expected) === 'number';
    const isKeys = Array.isArray(expected);
    if (!(isCount || isKeys)) throw new TypeError('Unexpected type');
    let keys = null;
    if (isKeys) {
      keys = new Set(expected);
      expected = expected.length;
    }
    let count = 0;
    let timer = null;
    let done = null;
    let isDistinct = false;
    let isDone = false;
    const data = {};

    const collector = (key, err, value) => {
      if (isDone) return collector;
      if (!isDistinct || !(key in data)) {
        if (!isCount && !keys.has(key)) return;
        count++;
      }
      if (err) return collector.finalize(err, data);
      data[key] = value;
      if (expected === count) {
        if (timer) clearTimeout(timer);
        collector.finalize(null, data);
      }
      return collector;
    };

    const methods = {
      pick: (key, value) => collector(key, null, value),
      fail: (key, err) => collector(key, err),

      take: (key, fn, ...args) => {
        fn(...args, (err, data) => collector(key, err, data));
        return collector;
      },

      timeout: (msec) => {
        if (msec) {
          timer = setTimeout(() => {
            const err = new Error('Collector timeout');
            collector.finalize(err, data);
          }, msec);
          timer.unref();
        }
        return collector;
      },

      done: (callback) => {
        done = callback;
        return collector;
      },

      finalize: (err, data) => {
        if (isDone) return collector;
        isDone = true;
        if (done) done(err, data);
        return collector;
      },

      distinct: (value = true) => {
        isDistinct = value;
        return collector;
      }
    };

    Object.assign(collector, methods);

    return collector;
  };

  function Collector() {}

  Collector.prototype.on = function(
    // Collector events:
    eventName,
    listener // handler function
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
    eventName, err, data
  ) {
    const event = this.events[eventName];
    if (event) event(err, data);
  };

  api.metasync.DataCollector = function(
    expected, // number of collect() calls expected
    timeout // collect timeout (optional)
    // returns: instance of DataCollector
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
    // returns: instance of DataCollector
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

  api.metasync.KeyCollector.prototype.stop = function() {
  };

  api.metasync.KeyCollector.prototype.pause = function() {
  };

  api.metasync.KeyCollector.prototype.resume = function() {
  };

};
