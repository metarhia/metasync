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

module.exports = {
  callbackify,
};
