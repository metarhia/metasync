'use strict';

const common = require('metarhia-common');

const flow = (
  // Create a composed function from flow syntax
  fns // array of functions, callback-last / err-first
  // Returns: function, composed callback-last / err-first
) => {
  let context = {};
  let timeout, timer;
  let finish = common.emptiness;
  let canceled = false;
  let paused = true;
  let arrayed = false;
  let parallel = false;

  if (fns.length === 1) {
    parallel = true;
    fns = fns[0];
  }

  const fn = (data, callback) => {
    finish = common.once(callback);
    if (timeout) {
      timer = setTimeout(() => {
        timer = null;
        finish(new Error('Flow timed out'));
      }, timeout);
    }
    if (canceled) {
      finish(new Error('Flow canceled'));
      return;
    }
    context = data;
    arrayed = Array.isArray(context);
    const end = (...args) => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      finish(...args);
    };
    paused = false;
    if (parallel) fn.parallel(end);
    else fn.sequential(end);
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
    },

    parallel(callback) {
      const done = common.once(callback);
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
          if (arrayed) context.push(result);
          else if (typeof(result) === 'object') {
            Object.assign(context, result);
          }
        }
        if (++counter === len) done(null, context);
      };
      let fn, finish;
      for (fn of fns) {
        // fn may be array of function
        finish = finishFn.bind(null, fn);
        if (Array.isArray(fn)) flow(fn)(context, finish);
        else if (fn.length === 2) fn(context, finish);
        else fn(finish);
      }
    },

    sequential(callback) {
      const done = common.once(callback);
      const len = fns.length;
      if (len === 0) {
        done(null, context);
        return;
      }
      let i = -1;
      const next = () => {
        let fn = null;
        const finish = (err, result) => {
          if (result !== context && result !== undefined) {
            if (arrayed) context.push(result);
            else if (typeof(result) === 'object') {
              Object.assign(context, result);
            }
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
      };
      next();
    }

  };

  return Object.assign(fn, methods);
};


module.exports = {
  flow,
};
