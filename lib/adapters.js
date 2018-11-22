'use strict';

const common = require('@metarhia/common');

// Convert source to callback-last contract
//   source - <Function>, promise or regular synchronous function
//
// Returns: <Function>, callback
const callbackify = source => {
  if (typeof source === 'function') {
    return (...args) => {
      const callback = common.unsafeCallback(args);
      if (callback) callback(null, source(...args));
    };
  } else {
    let callback = null;
    const fulfilled = value => {
      if (callback) callback(null, value);
    };
    const rejected = reason => {
      if (callback) callback(reason);
    };
    source.then(fulfilled).catch(rejected);
    return (...args) => {
      callback = common.unsafeCallback(args);
    };
  }
};

// Convert asynchronous function to Promise object
//   func - <Function>, callback-last function
//
// Returns: <Promise>
const promisify = func => {
  const promisified = (...args) => {
    const promise = new Promise((resolve, reject) => {
      func(...args, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    return promise;
  };
  return promisified;
};

// Convert synchronous function to Promise object
//   func - <Function>, regular synchronous function
//
// Returns: <Promise>
const promisifySync = func => (...args) => new Promise((resolve, reject) => {
  const result = func(...args);
  if (result instanceof Error) reject(result);
  else resolve(result);
});

module.exports = {
  callbackify,
  promisify,
  promisifySync,
};
