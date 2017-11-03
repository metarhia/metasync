'use strict';

const common = require('metarhia-common');

const flow = (
  // Create a composed function from flow syntax
  fns // array of functions, callback-last / err-first
  // Returns: function, composed callback-last / err-first
) => {
  let timeout, timer, composer, funcs;
  let finish = common.emptiness;
  let canceled = false;
  let paused = true;
  let arrayed = false;

  if (fns.length === 1) {
    composer = parallel;
    funcs = fns[0];
  } else {
    composer = sequential;
    funcs = fns;
  }

  const fn = (context, callback) => {
    arrayed = Array.isArray(context);
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
    composer(funcs, context, (...args) => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      finish(...args);
    });
  };

  const methods = {

    clone() {
      const cloned = flow(fns.slice());
      return cloned;
    },

    pause() {
      paused = true;
      return fn;
    },

    resume() {
      paused = false;
      return fn;
    },

    timeout(msec) {
      timeout = msec;
      return fn;
    },

    cancel() {
      if (!canceled) finish(new Error('Flow canceled'));
      canceled = true;
      return fn;
    },

    get paused() {
      return paused;
    },

    get canceled() {
      return canceled;
    },

    get arrayed() {
      return arrayed;
    },

    then(fulfilled, rejected) {
      const fulfill = common.once(fulfilled);
      const reject = common.once(rejected);
      fn({}, (err, result) => {
        if (err) reject(err);
        else fulfill(result);
      });
      return fn;
    }

  };

  return Object.assign(fn, methods);
};

function parallel(
  // Parallel execution
  fns, // array of function, callback-last / err-first
  context, // incoming data (optional)
  callback // function, err-first on done
) {
  if (!callback) {
    callback = context;
    context = {};
  }
  const done = common.once(callback);
  const isArray = Array.isArray(context);
  const len = fns.length;
  if (len === 0) {
    done(null, context);
    return;
  }
  let counter = 0;

  const finishFn = (fn, err, result) => {
    if (err) {
      done(err);
      return;
    }
    if (result !== context && result !== undefined) {
      if (isArray) context.push(result);
      else if (typeof(result) === 'object') Object.assign(context, result);
    }
    if (++counter === len) done(null, context);
  };

  let fn;
  for (fn of fns) {
    // fn may be array of function
    const finish = finishFn.bind(null, fn);
    if (Array.isArray(fn)) flow(fn)(context, finish);
    else if (fn.length === 2) fn(context, finish);
    else fn(finish);
  }
}

function sequential(
  // Sequential execution
  fns, // array of callback-last functions, callback contranct err-first
  context, // incoming data (optional)
  callback // function, err-first on done
) {
  if (!callback) {
    callback = context;
    context = {};
  }
  const done = common.once(callback);
  const isArray = Array.isArray(context);
  const len = fns.length;
  if (len === 0) {
    done(null, context);
    return;
  }
  let i = -1;

  function next() {
    let fn = null;
    const finish = (err, result) => {
      if (result !== context && result !== undefined) {
        if (isArray) context.push(result);
        else if (typeof(result) === 'object') Object.assign(context, result);
      }
      if (err) {
        done(err);
        return;
      }
      next();
    };
    if (++i === len) {
      done(null, context);
      return;
    }
    fn = fns[i];
    if (Array.isArray(fn)) flow(fn)(context, finish);
    else if (fn.length === 2) fn(context, finish);
    else fn(finish);
  }

  next();
}

module.exports = {
  flow,
};
