'use strict';

const throttle = (
  // Function throttling, executed once per interval
  timeout, // number, msec interval
  fn, // function, to be throttled
  ...args // array (optional), arguments for fn
  // Returns: function
) => {
  let timer;
  let wait = false;

  const execute = args ?
    (...pars) => (pars ? fn(...args, ...pars) : fn(...args)) :
    (...pars) => (pars ? fn(...pars) : fn());

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

const debounce = (
  // Debounce function, delayed execution
  timeout, // number, msec
  fn, // function, to be debounced
  ...args // array (optional), arguments for fn
) => {
  let timer;

  const debounced = () => (args ? fn(...args) : fn());

  const wrapped = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(debounced, timeout);
  };

  return wrapped;
};

const FN_TIMEOUT = 'Metasync: asynchronous function timed out';

const timeout = (
  // Set timeout for asynchronous function execution
  timeout, // number, time interval
  fn, // function, to be executed
  callback // function, callback on done
) => {
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
