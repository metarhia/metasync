'use strict';

function Memoized() {}

// Create memoized function
//   fn - <Function>, sync or async
//
// Returns: <Function>, memoized
const memoize = fn => {
  const cache = new Map();

  const memoized = function (...args) {
    const callback = args.pop();
    const key = args[0];
    const record = cache.get(key);
    if (record) {
      callback(record.err, record.data);
      return;
    }
    fn(...args, (err, data) => {
      memoized.add(key, err, data);
      memoized.emit('memoize', key, err, data);
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
    events: {
      timeout: null,
      memoize: null,
      overflow: null,
      add: null,
      del: null,
      clear: null,
    },
  };

  Object.setPrototypeOf(memoized, Memoized.prototype);
  return Object.assign(memoized, fields);
};

Memoized.prototype.clear = function () {
  this.emit('clear');
  this.cache.clear();
};

Memoized.prototype.add = function (key, err, data) {
  this.emit('add', err, data);
  this.cache.set(key, { err, data });
  return this;
};

Memoized.prototype.del = function (key) {
  this.emit('del', key);
  this.cache.delete(key);
  return this;
};

Memoized.prototype.get = function (key, callback) {
  const record = this.cache.get(key);
  callback(record.err, record.data);
  return this;
};

// Add event listener
//   eventName - <string>
//   listener - <Function>, handler
//
// Example:
// const memoized = new Memoized();
// memoized.on('memoize', (err, data) => { ... });
// memoized.on('add', (key, err, data) => { ... });
// memoized.on('del', (key) => { ... })
// memoized.on('clear', () => { ... })
Memoized.prototype.on = function (eventName, listener) {
  if (eventName in this.events) {
    this.events[eventName] = listener;
  }
};

// Emit Memoized events
//   eventName - <string>
//   args - <any>, rest arguments
Memoized.prototype.emit = function (eventName, ...args) {
  const event = this.events[eventName];
  if (event) event(...args);
};

module.exports = { memoize, Memoized };
