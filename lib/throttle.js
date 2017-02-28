'use strict';

const flow = require('./flow');
const arrayUtils = require('./array.utils');
const arrayChain = require('./array.chain');
const collectors = require('./collectors');
const queue = require('./queue');

const metasync = {};
module.exports = metasync;

Object.assign(metasync, flow, arrayUtils, arrayChain, collectors, queue);

metasync.throttle = (
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

metasync.timeout = (
  // Set timeout for function execution
  timeout, // time interval
  asyncFunction, // async function to be executed
  // done - callback function
  doneFunction // callback function on done
) => {
  let finished = false;

  const timer = setTimeout(() => {
    if (!finished) {
      finished = true;
      doneFunction();
    }
  }, timeout);

  asyncFunction(() => {
    if (!finished) {
      clearTimeout(timer);
      finished = true;
      doneFunction();
    }
  });
};
