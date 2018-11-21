'use strict';

const common = require('@metarhia/common');

const UNEXPECTED_KEY = 'Metasync: unexpected key: ';
const COLLECT_TIMEOUT = 'Metasync: Collector timed out';
const COLLECT_CANCELED = 'Metasync: Collector cancelled';

class Collector {
  constructor(
    expected // number or array of string, count or keys
  ) {
    this.expectKeys = Array.isArray(expected) ? new Set(expected) : null;
    this.expected = this.expectKeys ? expected.length : expected;
    this.keys = new Set();
    this.count = 0;
    this.timer = null;
    this.onDone = common.emptiness;
    this.isDistinct = false;
    this.isDone = false;
    this.data = {};
  }

  collect(key, err, value) {
    if (this.isDone) return this;
    if (err) {
      this.finalize(err, this.data);
      return this;
    }
    if (this.expectKeys && !this.expectKeys.has(key)) {
      if (this.isDistinct) {
        const err = new Error(UNEXPECTED_KEY + key);
        this.finalize(err, this.data);
        return this;
      }
    } else if (!this.keys.has(key)) {
      this.count++;
    }
    this.data[key] = value;
    this.keys.add(key);
    if (this.expected === this.count) {
      this.finalize(null, this.data);
    }
    return this;
  }

  pick(key, value) {
    this.collect(key, null, value);
    return this;
  }

  fail(key, err) {
    this.collect(key, err);
    return this;
  }

  take(key, fn, ...args) {
    fn(...args, (err, data) => {
      this.collect(key, err, data);
    });
    return this;
  }

  timeout(msec) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (msec > 0) {
      this.timer = setTimeout(() => {
        const err = new Error(COLLECT_TIMEOUT);
        this.finalize(err, this.data);
      }, msec);
    }
    return this;
  }

  done(callback) {
    this.onDone = callback;
    return this;
  }

  finalize(key, err, data) {
    if (this.isDone) return this;
    if (this.onDone) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.isDone = true;
      this.onDone(key, err, data);
    }
    return this;
  }

  distinct(value = true) {
    this.isDistinct = value;
    return this;
  }

  cancel(err) {
    err = err || new Error(COLLECT_CANCELED);
    this.finalize(err, this.data);
    return this;
  }

  then(fulfilled, rejected) {
    const fulfill = common.once(fulfilled);
    const reject = common.once(rejected);
    this.onDone = (err, result) => {
      if (err) reject(err);
      else fulfill(result);
    };
    return this;
  }
}

// Collector instance constructor
//   expected - number or array of string,
// Returns: Collector, instance
const collect = expected => new Collector(expected);

module.exports = { collect };
