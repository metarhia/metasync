'use strict';

const throttle = (
  // Function throttling, executed once per interval
  timeout, // msec interval
  fn, // function to be throttled
  args // arguments array for fn (optional)
) => {
  let timer;
  let wait = false;
  let wrapped = null;

  const throttled = () => {
    timer = undefined;
    if (wait) wrapped();
  };

  wrapped = () => {
    if (!timer) {
      timer = setTimeout(throttled, timeout);
      if (args) fn(...args);
      else fn();
      wait = false;
    } else {
      wait = true;
    }
  };

  return wrapped;
};

const debounce = (
  // Debounce function, delayed execution
  timeout, // msec
  fn, // function to be debounced
  args // arguments array for fn (optional)
) => {
  let timer;

  const debounced = () => {
    if (args) fn(...args);
    else fn();
  };

  const wrapped = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(debounced, timeout);
  };

  return wrapped;
};

const timeout = (
  // Set timeout for asynchronous function execution
  timeout, // time interval
  fn, // async function to be executed
  callback // callback function on done
) => {
  let finished = false;

  const timer = setTimeout(() => {
    finished = true;
    callback(new Error('Asynchronous function timed out'));
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
  timeout
};
