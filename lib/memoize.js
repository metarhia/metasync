'use strict';

const util = require('util');

function Memoized() {
}

util.inherits(Memoized, Function);

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
    maxSize: 0
  };

  Object.setPrototypeOf(memoized, Memoized.prototype);
  return Object.assign(memoized, fields);
};

Memoized.prototype.clear = function() {
  this.cache.clear();
};

module.exports = {
  memoize,
};
