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
  let done = common.emptiness;

  if (fns.length === 1) {
    parallel = true;
    fns = fns[0];
  }
  const len = fns.length;

  const comp = (data, callback) => {
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
    if (parallel) comp.parallel(end);
    else comp.sequential(end);
  };

  const methods = {

    clone() {
      const cloned = flow(fns.slice());
      return cloned;
    },

    pause() {
      paused = true;
      return this;
    },

    resume() {
      paused = false;
      return this;
    },

    timeout(msec) {
      timeout = msec;
      return this;
    },

    cancel() {
      if (!canceled) finish(new Error('Flow canceled'));
      canceled = true;
      return this;
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
      this({}, (err, result) => {
        if (err) reject(err);
        else fulfill(result);
      });
      return this;
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
      return this;
    },

    parallel(callback) {
      done = common.once(callback);
      if (len === 0) {
        done(null, context);
        return;
      }
      let counter = 0;
      const finishFn = (fn, err, result) => {
        this.collect(err, result);
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
      done = common.once(callback);
      if (len === 0) {
        done(null, context);
        return;
      }
      let i = -1;
      const next = () => {
        if (++i === len) {
          done(null, context);
          return;
        }
        const fn = fns[i];
        const finish = (err, result) => {
          this.collect(err, result);
          next();
        };
        if (Array.isArray(fn)) flow(fn)(context, finish);
        else if (fn.length === 2) fn(context, finish);
        else fn(finish);
      };
      next();
    }

  };

  return Object.assign(comp, methods);
};


module.exports = {
  flow,
};
