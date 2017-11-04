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
  let parallel = false;
  let done = common.emptiness;

  if (fns.length === 1) {
    parallel = true;
    fns = fns[0];
  }
  const len = fns.length;

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
      comp.finalize(null);
      return;
    }
    if (parallel) comp.parallel();
    else comp.sequential();
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

    finalize(err) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      done(err, context);
    },

    collect(err, result) {
      if (err) {
        done(err);
        return;
      }
      if (result !== context && result !== undefined) {
        if (arrayed) context.push(result);
        else if (typeof(result) === 'object') Object.assign(context, result);
      }
      return comp;
    },

    parallel() {
      let counter = 0;
      const finishFn = (fn, err, result) => {
        comp.collect(err, result);
        if (++counter === len) comp.finalize(null);
      };
      let i, fn, finish;
      for (i = 0; i < len; i++) {
        fn = fns[i];
        finish = finishFn.bind(null, fn);
        if (Array.isArray(fn)) flow(fn)(context, finish);
        else if (fn.length === 2) fn(context, finish);
        else fn(finish);
      }
    },

    sequential() {
      let i = -1;
      const next = () => {
        if (++i === len) {
          comp.finalize(null);
          return;
        }
        const fn = fns[i];
        const finish = (err, result) => {
          comp.collect(err, result);
          next();
        };
        if (Array.isArray(fn)) flow(fn)(context, finish);
        else if (fn.length === 2) fn(context, finish);
        else fn(finish);
      };
      next();
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
