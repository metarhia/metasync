'use strict';

const common = require('metarhia-common');

const callbackify = (
  source // promise or sync function
  // Returns: callback, function
) => {
  if (typeof(source) === 'function') {
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
