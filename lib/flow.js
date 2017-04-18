'use strict';

module.exports = (api) => {

  api.metasync.composition = (
    // Functional Asynchronous Composition
    fns, // array of function([data,] callback)
    // data - incoming data
    // callback(data)
    //   data - outgoing data
    done, // callback(data)
    // data - hash with of functions results
    data // incoming data
  ) => {
    if (fns.length === 1) api.metasync.parallel(fns[0], done, data);
    else api.metasync.sequential(fns, done, data);
  };

  api.metasync.parallel = (
    // Parallel execution
    fns, // array of function([data,] callback)
    // data - incoming data
    // callback - function(data)
    //   data - outgoing data
    done, // on done callback(data)
    // data - hash with of functions results
    data = {} // incoming data
  ) => {
    const len = fns.length;
    let counter = 0;
    let finished = false;
    done = api.metasync.cb(done);

    if (len < 1) return done(data);
    fns.forEach((fn) => {
      const finish = (result) => {
        if (fn.name && result) data[fn.name] = result;
        if (result instanceof Error) {
          if (!finished) done(result);
          finished = true;
        } else if (++counter >= len) {
          done(data);
        }
      };
      // fn may be array of function
      if (Array.isArray(fn)) api.metasync.composition(fn, finish, data);
      else if (fn.length === 2) fn(data, finish);
      else fn(finish);
    });
  };

  api.metasync.sequential = (
    // Sequential execution
    fns, // array of function([data,] callback)
    // data - incoming data
    // callback - function(data)
    //   data - outgoing data
    done, // on done callback(data)
    // data - hash with of functions results
    data = {} // incoming data
  ) => {
    let i = -1;
    const len = fns.length;
    done = api.metasync.cb(done);

    function next(result) {
      if (++i >= len) return done(data);
      const fn = fns[i];
      if (fn.name && result) data[fn.name] = result;
      if (result instanceof Error) return done(result);
      if (Array.isArray(fn)) api.metasync.composition(fn, next, data);
      else if (fn.length === 2) fn(data, next);
      else fn(next);
    }

    if (len > 0) next();
    else done(data);
  };


};
