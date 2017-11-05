'use strict';

const common = require('metarhia-common');

const flow = (
  // Create a composed function from flow syntax
  fns // array of functions, callback-last / err-first
  // Returns: function, composed callback-last / err-first
) => {
  let context = {};
  let timeout, timer;
  let canceled = false;
  let paused = true;
  let arrayed = false;
  let parallelize = false;
  let done = common.emptiness;

  if (fns.length === 1) {
    parallelize = true;
    fns = fns[0];
  }
  const len = fns.length;

  const exec = (fn, finish) => {
    if (Array.isArray(fn)) flow(fn)(context, finish);
    else if (fn.length === 2) fn(context, finish);
    else fn(finish);
  };

  const finalize = (err) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    done(err, context);
  };

  const collect = (err, result) => {
    if (err) {
      done(err);
      return;
    }
    if (result !== context && result !== undefined) {
      if (arrayed) context.push(result);
      else if (typeof(result) === 'object') Object.assign(context, result);
    }
  };

  const parallel = () => {
    let counter = 0;
    const finish = (fn, err, result) => {
      collect(err, result);
      if (++counter === len) finalize();
    };
    let i, fn;
    for (i = 0; i < len; i++) {
      fn = fns[i];
      exec(fn, finish.bind(null, fn));
    }
  };

  const sequential = () => {
    let i = -1;
    function next() {
      if (++i === len) {
        finalize();
        return;
      }
      const fn = fns[i];
      exec(fn, finish);
    }
    function finish(err, result) {
      collect(err, result);
      next();
    }
    next();
  };

  const comp = (data, callback) => {
    done = common.once(callback);
    if (timeout) {
      timer = setTimeout(() => {
        timer = null;
        done(new Error('Flow timed out'));
      }, timeout);
    }
    if (canceled) {
      done(new Error('Flow canceled'));
      return;
    }
    context = data;
    arrayed = Array.isArray(context);
    paused = false;
    if (len === 0) {
      finalize();
      return;
    }
    if (parallelize) parallel();
    else sequential();
  };

  const methods = {

    then(fulfilled, rejected) {
      const fulfill = common.once(fulfilled);
      const reject = common.once(rejected);
      comp({}, (err, result) => {
        if (err) reject(err);
        else fulfill(result);
      });
      return comp;
    },

    clone() {
      const cloned = flow(fns.slice());
      return cloned;
    },

    pause() {
      paused = true;
      return comp;
    },

    resume() {
      paused = false;
      return comp;
    },

    timeout(msec) {
      timeout = msec;
      return comp;
    },

    cancel() {
      if (!canceled) done(new Error('Flow canceled'));
      canceled = true;
      return comp;
    },

    get paused() {
      return paused;
    },

    get canceled() {
      return canceled;
    },

    get arrayed() {
      return arrayed;
    }

  };

  return Object.assign(comp, methods);
};

module.exports = {
  flow,
};
