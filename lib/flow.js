'use strict';

module.exports = (api) => {

  api.metasync.FLOW_PARALLEL = 0;
  api.metasync.FLOW_SEQUENTIAL = 1;

  api.metasync.flow = (
    // Create a composed function from flow syntax
    fns // array of errback functions
    // returns: composed errback function
  ) => {
    let type, timeout, composer;

    if (fns.length === 1) {
      type = api.metasync.FLOW_PARALLEL;
      composer = api.metasync.parallel;
      fns = fns[0];
    } else {
      type = api.metasync.FLOW_SEQUENTIAL;
      composer = api.metasync.sequential;
    }

    const fn = (data, done) => {
      if (timeout) {
        fn.timer = setTimeout(() => {
          fn.timer = null;
          done(new Error('Timeout'));
        }, timeout);
      }
      fn.paused = false;
      composer(fns, data, (...args) => {
        if (fn.timer) clearTimeout(fn.timer);
        done(...args);
      });
    };

    fn.paused = true;
    fn.type = type;
    fn.clone = () => {};
    fn.cancel = () => {};
    fn.pause = () => (fn.paused = true);
    fn.resume = () => (fn.paused = false);
    fn.timeout = (msec) => (timeout = msec);

    return fn;
  };

  api.metasync.parallel = (
    // Parallel execution
    fns, // array of errback functions
    data, // incoming data (optional)
    done // errback on done
  ) => {
    if (!done) {
      done = data;
      data = {};
    }
    const len = fns.length;
    done = api.common.cb(done);
    if (len === 0) return done(null, data);
    let counter = 0;

    const finishFn = (fn, err, result) => {
      if (fn.name && result) data[fn.name] = result;
      if (err) return done(err);
      if (++counter === len) done(null, data);
    };

    let fn;
    for (fn of fns) {
      // fn may be array of function
      const finish = finishFn.bind(null, fn);
      if (Array.isArray(fn)) api.metasync.flow(fn)(data, finish);
      else if (fn.length === 2) fn(data, finish);
      else fn(finish);
    }
  };

  api.metasync.sequential = (
    // Sequential execution
    fns, // array of errback functions
    data, // incoming data (optional)
    done // errback on done
  ) => {
    if (!done) {
      done = data;
      data = {};
    }
    const len = fns.length;
    done = api.common.cb(done);
    if (len === 0) return done(null, data);
    let i = -1;

    function next() {
      let fn = null;
      const finish = (err, result) => {
        if (fn.name && result) data[fn.name] = result;
        if (err) return done(err);
        next();
      };
      if (++i === len) return done(null, data);
      fn = fns[i];
      if (Array.isArray(fn)) api.metasync.flow(fn)(data, finish);
      else if (fn.length === 2) fn(data, finish);
      else fn(finish);
    }

    next();
  };

  api.metasync.firstOf = (
    // Executes all asynchronous functions and pass first result to callback
    fns, // array of errback functions
    done // errback on done
  ) => {
    done = api.common.cb(done);
    api.metasync.each(fns, (f, iterCb) => f((...args) => {
      done(...args);
      iterCb(...args);
    }));
  };

};
