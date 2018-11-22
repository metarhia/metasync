'use strict';

const common = require('@metarhia/common');

const { each } = require('./array');

// Executes all asynchronous functions and pass first result to callback
//   fns - <Function[]>, callback-last / err-first
//   callback - <Function>, on done, err-first
const firstOf = (fns, callback) => {
  const done = common.once(callback);
  each(fns, (f, iterCb) => f((...args) => {
    done(...args);
    iterCb(...args);
  }));
};

// Parallel execution
//   fns - <Function[]>, callback-last / err-first
//   context - <Object>, incoming data, optional
//   callback - <Function>, on done, err-first
const parallel = (fns, context, callback) => {
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

  // fn may be array of function
  for (const fn of fns) {
    const finish = finishFn.bind(null, fn);
    if (fn.length === 2) fn(context, finish);
    else fn(finish);
  }
};

// Sequential execution
//   fns - <Function[]>, callback-last with err-first contract
//   context - <Object>, incoming data, optional
//   callback - <Function>, err-first on done
const sequential = (fns, context, callback) => {
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
