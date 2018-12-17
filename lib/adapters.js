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

// Convert async function to Promise-returning function
//   fn <Function> callback-last function
//
// Returns: <Function> Promise-returning function
const promisify = fn => (...args) => new Promise((resolve, reject) => {
  fn(...args, (err, data) => {
    if (err) reject(err);
    else resolve(data);
  });
});

// Convert sync function to Promise object
//   fn <Function> regular synchronous function
//
// Returns: <Function> Promise-returning function
const promisifySync = fn => (...args) => {
  try {
    const result = fn(...args);
    if (result instanceof Error) return Promise.reject(result);
    else return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  callbackify,
  promisify,
  promisifySync,
};
