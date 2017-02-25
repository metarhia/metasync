'use strict';

const metasync = {};
module.exports = metasync;

metasync.composition = (
  // Functional Asynchronous Composition
  fns, // array of function([data,] callback)
  // data - incoming data
  // callback(data)
  //   data - outgoing data
  done, // callback(data)
  // data - hash with of functions results
  data // incoming data
) => {
  if (fns.length === 1) {
    metasync.parallel(fns[0], done, data);
  } else {
    metasync.sequential(fns, done, data);
  }
};

metasync.parallel = (
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

  if (len < 1) {
    if (done) done(data);
    return;
  }
  fns.forEach((fn) => {
    const finish = (result) => {
      if (fn.name && result) data[fn.name] = result;
      if (result instanceof Error) {
        if (!finished) {
          if (done) done(result);
        }
        finished = true;
      } else if (++counter >= len) {
        if (done) done(data);
      }
    };
    // fn may be array of function
    if (Array.isArray(fn)) metasync.composition(fn, finish, data);
    else if (fn.length === 2) fn(data, finish);
    else fn(finish);
  });
};

metasync.sequential = (
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

  function next() {
    let fn = null;
    const finish = (result) => {
      if (fn.name && result) data[fn.name] = result;
      if (result instanceof Error) {
        if (done) done(result);
        return;
      }
      next();
    };
    if (++i >= len) {
      if (done) done(data);
      return;
    }
    fn = fns[i];
    if (Array.isArray(fn)) metasync.composition(fn, finish, data);
    else if (fn.length === 2) fn(data, finish);
    else fn(finish);
  }

  if (len > 0) next();
  else if (done) done(data);
};
