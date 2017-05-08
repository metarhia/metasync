'use strict';

module.exports = (api) => {

  function Collector(
    collectorType, // string representing collector type in error
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
        const err = new Error(collectorType + ' timeout');
        collector.emit('timeout', err, collector.data);
      }, timeout);
    }
  }

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

  Collector.prototype.collect = function(
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

  api.metasync.DataCollector = Collector.bind(null, 'DataCollector');

  api.metasync.KeyCollector = function(
    // Key Collector
    keys, // array of keys, example: ['config', 'users', 'cities']
    timeout // collect timeout (optional)
  ) {
    this.isDone = false;
    this.keys = keys;
    Collector.call(this, 'KeyCollector', keys.length, timeout);
  };

  api.util.inherits(api.metasync.KeyCollector, Collector);

  api.metasync.KeyCollector.prototype.collect = function(
    key, data
  ) {
    if (this.keys.includes(key)) {
      Collector.prototype.collect.call(this, key, data);
    }
  };

  api.metasync.KeyCollector.prototype.stop = function() {
  };

  api.metasync.KeyCollector.prototype.pause = function() {
  };

  api.metasync.KeyCollector.prototype.resume = function() {
  };
};
