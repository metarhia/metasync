'use strict';

module.exports = (api) => {

  api.metasync.throttle = (
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

  api.metasync.timeout = (
    // Set timeout for function execution
    timeout, // time interval
    asyncFunction, // async function to be executed
    // done - callback function
    done // callback function on done
  ) => {
    let finished = false;
    done = api.metasync.cb(done);

    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        done();
      }
    }, timeout);

    asyncFunction(() => {
      if (!finished) {
        clearTimeout(timer);
        finished = true;
        done();
      }
    });
  };

};
