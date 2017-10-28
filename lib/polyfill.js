'use strict';

const common = require('metarhia-common');

const callbackify = (
  source // promise or sync function
  // Returns: callback, function
) => {
  const isFunction = typeof(source) === 'function';
  if (isFunction) {
    return (...args) => {
      const callback = common.safeCallback(args);
      callback(null, source(...args));
    };
  } else {
    let callback = common.emptiness;
    const fulfilled = value => callback(null, value);
    const rejected = reason => callback(reason);
    source.then(fulfilled).catch(rejected);
    return (...args) => {
      callback = common.safeCallback(args);
    };
  }
};

const promisify = (
  func // function, callback-last contract or regular sync function
  // Returns: promise object
) => {
  const promisified = (...args) => {
    const promise = new Promise((resolve, reject) => {
      func(...args, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
    return promise;
  };
  return promisified;
};

module.exports = {
  callbackify,
  promisify,
};
