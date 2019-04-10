'use strict';

// Get throttling function, executed once per interval
// Signature: timeout, fn, ...args
//   timeout - <number>, msec interval
//   fn - <Function>, to be throttled
//   args - <Array>, arguments for fn, optional
//
// Returns: <Function>
const throttle = (timeout, fn, ...args) => {
  let timer;
  let wait = false;

  const execute = args
    ? (...pars) => (pars ? fn(...args, ...pars) : fn(...args))
    : (...pars) => (pars ? fn(...pars) : fn());

  const delayed = (...pars) => {
    timer = undefined;
    if (wait) execute(...pars);
  };

  const throttled = (...pars) => {
    if (!timer) {
      timer = setTimeout(delayed, timeout, ...pars);
      wait = false;
      execute(...pars);
    }
    wait = true;
  };

  return throttled;
};

// Debounce function, delayed execution
// Signature: timeout, fn, ...args
//   timeout - <number>, msec
//   fn - <Function>, to be debounced
//   args - <Array>, arguments for fn, optional
const debounce = (timeout, fn, ...args) => {
  let timer;

  const debounced = () => (args ? fn(...args) : fn());

  const wrapped = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(debounced, timeout);
  };

  return wrapped;
};

const FN_TIMEOUT = 'Metasync: asynchronous function timed out';

// Set timeout for asynchronous function execution
//   timeout - <number>, time interval
//   fn - <Function>, to be executed
//   callback - <Function>, callback(...args), on done
//     args - <Array>
const timeout = (timeout, fn, callback) => {
  let finished = false;

  const timer = setTimeout(() => {
    finished = true;
    callback(new Error(FN_TIMEOUT));
  }, timeout);

  fn((...args) => {
    if (!finished) {
      clearTimeout(timer);
      finished = true;
      callback(...args);
    }
  });
};

module.exports = {
  throttle,
  debounce,
  timeout,
};
