'use strict';

const common = require('metarhia-common');

const { each } = require('./array');

const firstOf = (
  // Executes all asynchronous functions and pass first result to callback
  fns, // array of function, callback-last / err-first
  callback // function, err-first on done
) => {
  const done = common.once(callback);
  each(fns, (f, iterCb) => f((...args) => {
    done(...args);
    iterCb(...args);
  }));
};

module.exports = {
  firstOf,
};
