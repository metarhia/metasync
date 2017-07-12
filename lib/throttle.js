'use strict';

const common = require('metarhia-common');

const throttle = (
  // Function throttling
  timeout, // time interval
  fn, // function to be executed once per timeout
  args // arguments array for fn (optional)
) => {
  let timer = null;
  let wait = false;
  return function throttled() {
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        if (wait) throttled();
      }, timeout);
      if (args) fn(...args);
      else fn();
      wait = false;
    } else {
      wait = true;
    }
  };
};

const debounce = (
  timeout, // msec
  fn, // function to be wrapped
  args = [] // function arguments
) => {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), timeout);
  };
};

const timeout = (
  // Set timeout for function execution
  timeout, // time interval
  fn, // async function to be executed
  // done - callback function
  done // callback function on done
) => {
  let finished = false;
  done = common.cb(done);

  const timer = setTimeout(() => {
    finished = true;
    done(null);
  }, timeout);

  fn((...args) => {
    if (!finished) {
      clearTimeout(timer);
      finished = true;
      done(...args);
    }
  });
};

module.exports = {
  throttle,
  debounce,
  timeout
};
