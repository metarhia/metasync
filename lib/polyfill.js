'use strict';

const common = require('metarhia-common');

const callbackify = (
  promise // promise object
  // Returns: callback, function
) => {
  let callback = common.emptiness;
  const fulfilled = value => callback(null, value);
  const rejected = reason => callback(reason);
  promise.then(fulfilled).catch(rejected);
  return (...args) => {
    callback = common.safeCallback(args);
  };
};

const promisify = (
  func // function, callback-last contract
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
