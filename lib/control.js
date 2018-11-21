'use strict';

const common = require('@metarhia/common');

const { each } = require('./array');

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

const parallel = (
  // Parallel execution
  fns, // array of function, callback-last / err-first
  context, // incoming data (optional)
  callback // function, err-first on done
) => {
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
      else if (typeof result === 'object') Object.assign(context, result);
    }
    if (++counter === len) done(null, context);
  };

  for (const fn of fns) {
    // fn may be array of function
    const finish = finishFn.bind(null, fn);
    if (fn.length === 2) fn(context, finish);
    else fn(finish);
  }
};

const sequential = (
  // Sequential execution
  fns, // array of callback-last functions, callback contranct err-first
  context, // incoming data (optional)
  callback // function, err-first on done
) => {
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

  const next = () => {
    let fn = null;
    const finish = (err, result) => {
      if (result !== context && result !== undefined) {
        if (isArray) context.push(result);
        else if (typeof result === 'object') Object.assign(context, result);
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
    if (fn.length === 2) fn(context, finish);
    else fn(finish);
  };

  next();
};

module.exports = {
  firstOf,
  parallel,
  sequential,
};
