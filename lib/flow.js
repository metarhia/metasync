'use strict';

module.exports = (api) => {

  api.metasync.flow = (
    // Create a composed function from flow syntax
    fns // array of errback functions
    // returns: composed errback function
  ) => (
    data, // pass data structure to flow
    done // errback on done
  ) => {
    if (fns.length === 1) api.metasync.parallel(fns[0], done, data);
    else api.metasync.sequential(fns, done, data);
  };

  api.metasync.composition = (
    // Create a composed function from flow syntax
    // it's deprecated, use metasync.flow instead
    fns, // array of errback functions
    done, // errback on done
    data // incoming data
  ) => {
    if (fns.length === 1) api.metasync.parallel(fns[0], done, data);
    else api.metasync.sequential(fns, done, data);
  };

  api.metasync.parallel = (
    // Parallel execution
    fns, // array of errback functions
    done, // errback on done
    data = {} // incoming data
  ) => {
    const len = fns.length;
    let counter = 0;
    done = api.common.cb(done);
    if (len === 0) return done(null, data);

    const finishFn = (fn, err, result) => {
      if (fn.name && result) data[fn.name] = result;
      if (err) return done(err);
      if (++counter === len) done(null, data);
    };

    let fn;
    for (fn of fns) {
      // fn may be array of function
      const finish = finishFn.bind(null, fn);
      if (Array.isArray(fn)) api.metasync.composition(fn, finish, data);
      else if (fn.length === 2) fn(data, finish);
      else fn(finish);
    }
  };

  api.metasync.sequential = (
    // Sequential execution
    fns, // array of errback functions
    done, // errback on done
    data = {} // incoming data
  ) => {
    let i = -1;
    const len = fns.length;
    done = api.common.cb(done);

    function next() {
      let fn = null;
      const finish = (err, result) => {
        if (fn.name && result) data[fn.name] = result;
        if (err) return done(err);
        next();
      };
      if (++i === len) return done(null, data);
      fn = fns[i];
      if (Array.isArray(fn)) api.metasync.composition(fn, finish, data);
      else if (fn.length === 2) fn(data, finish);
      else fn(finish);
    }

    if (len > 0) next();
    else done(null, data);
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
