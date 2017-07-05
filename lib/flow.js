'use strict';

module.exports = (api) => {

  api.metasync.flow = (
    // Create a composed function from flow syntax
    fns // array of errback functions
    // returns: composed errback function
  ) => {
    let timeout, timer, composer, funcs;
    let finish = api.common.emptiness;
    let canceled = false;
    let paused = true;

    if (fns.length === 1) {
      composer = api.metasync.parallel;
      funcs = fns[0];
    } else {
      composer = api.metasync.sequential;
      funcs = fns;
    }

    const fn = (data, done) => {
      finish = api.common.cb(done);
      if (canceled) return finish(new Error('Flow canceled'));
      if (timeout) {
        timer = setTimeout(() => {
          timer = null;
          finish(new Error('Timeout'));
        }, timeout);
      }
      paused = false;
      composer(funcs, data, (...args) => {
        if (timer) clearTimeout(timer);
        finish(...args);
      });
    };

    const methods = {
      clone: () => api.metasync.flow(fns),
      pause: () => (paused = true),
      resume: () => (paused = false),
      timeout: (msec) => (timeout = msec),
      cancel: () => {
        canceled = true;
        if (!paused) finish(new Error('Flow canceled'));
      }
    };

    Object.assign(fn, methods);

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
      if (err) return done(err);
      if (fn.name && result) data[fn.name] = result;
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
