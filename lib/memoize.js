'use strict';

function Memoized() {}

const memoize = (
  // Create memoized function
  fn // function, sync or async
  // Returns: function, memoized
) => {
  const cache = new Map();

  const memoized = function(...args) {
    const callback = args.pop();
    const key = args[0];
    const record = cache.get(key);
    if (record) {
      callback(record.err, record.data);
      return;
    }
    fn(...args, (err, data) => {
      cache.set(key, { err, data });
      callback(err, data);
    });
  };

  const fields = {
    cache,
    timeout: 0,
    limit: 0,
    size: 0,
    maxSize: 0,
    maxCount: 0,
  };

  Object.setPrototypeOf(memoized, Memoized.prototype);
  return Object.assign(memoized, fields);
};

Memoized.prototype.clear = function() {
  this.cache.clear();
};

Memoized.prototype.add = function(key, err, data) {
  this.cache.set(key, { err, data });
  return this;
};

Memoized.prototype.del = function(key) {
  this.cache.delete(key);
  return this;
};

Memoized.prototype.get = function(key, callback) {
  const record = this.cache.get(key);
  callback(record.err, record.data);
  return this;
};

module.exports = {
  memoize,
};
