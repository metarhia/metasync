'use strict';

const common = require('metarhia-common');

const { each } = require('./array');
const { concat } = require('./fp');

const flow = (
  // Create a composed function from flow syntax
  fns // array of functions, callback-last / err-first
  // Returns: function, composed callback-last / err-first
) => {
  let timeout, timer, composer, funcs;
  let finish = common.emptiness;
  let canceled = false;
  let paused = true;

  if (fns.length === 1) {
    composer = parallel;
    funcs = fns[0];
  } else {
    composer = sequential;
    funcs = fns;
  }

  const fn = (data, callback) => {
    finish = common.once(callback);
    if (canceled) {
      finish(new Error('Flow canceled'));
      return;
    }
    if (timeout) {
      timer = setTimeout(() => {
        timer = null;
        finish(new Error('Flow timed out'));
      }, timeout);
    }
    paused = false;
    composer(funcs, data, (...args) => {
      if (timer) clearTimeout(timer);
      finish(...args);
    });
  };

  const methods = {

    clone: () => {
      const cloned = flow(fns.slice());
      return cloned;
    },

    pause: () => {
      if (!paused) paused = true;
      return fn;
    },

    resume: () => {
      if (paused) paused = false;
      return fn;
    },

    timeout: (msec) => {
      timeout = msec;
      return fn;
    },

    cancel: () => {
      if (!canceled) finish(new Error('Flow canceled'));
      canceled = true;
      return fn;
    },

    then: common.curry(concat, fn),

  };

  Object.assign(fn, methods);
  return fn;
};

function parallel(
  // Parallel execution
  fns, // array of function, callback-last / err-first
  data, // incoming data (optional)
  callback // function, err-first on done
) {
  if (!callback) {
    callback = data;
    data = {};
  }
  const done = common.once(callback);
  const isArray = Array.isArray(data);
  const len = fns.length;
  if (len === 0) {
    done(null, data);
    return;
  }
  let counter = 0;

  const finishFn = (fn, err, result) => {
    if (err) {
      done(err);
      return;
    }
    if (result !== data) {
      if (isArray) data.push(result);
      else if (fn.name) data[fn.name] = result;
    }
    if (++counter === len) done(null, data);
  };

  let fn;
  for (fn of fns) {
    // fn may be array of function
    const finish = finishFn.bind(null, fn);
    if (Array.isArray(fn)) flow(fn)(data, finish);
    else if (fn.length === 2) fn(data, finish);
    else fn(finish);
  }
}

function sequential(
  // Sequential execution
  fns, // array of callback-last functions, callback contranct err-first
  data, // incoming data (optional)
  callback // function, err-first on done
) {
  if (!callback) {
    callback = data;
    data = {};
  }
  const done = common.once(callback);
  const isArray = Array.isArray(data);
  const len = fns.length;
  if (len === 0) {
    done(null, data);
    return;
  }
  let i = -1;

  function next() {
    let fn = null;
    const finish = (err, result) => {
      if (result !== data) {
        if (isArray) data.push(result);
        else if (fn.name) data[fn.name] = result;
      }
      if (err) {
        done(err);
        return;
      }
      next();
    };
    if (++i === len) {
      done(null, data);
      return;
    }
    fn = fns[i];
    if (Array.isArray(fn)) flow(fn)(data, finish);
    else if (fn.length === 2) fn(data, finish);
    else fn(finish);
  }

  next();
}

const firstOf = (
  // Executes all asynchronous functions and pass first result to callback
  fns, // array of function, callback-last / err-first
  callback // function, err-first on done
) => {
  const done = common.once(callback);
  each(fns, (f, iterCb) => f((...args) => {
    done(...args);
    iterCb(...args);
  }));
};

module.exports = {
  flow,
  parallel,
  sequential,
  firstOf,
};
