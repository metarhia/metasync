'use strict';

let asyncChainMethods = null;
// Convert synchronous function to asynchronous
// Transform function with args arguments and callback
// to function with args as separate values and callback
//   fn - <Function>, callback-last / err-first
//
// Returns: <Function>
const toAsync = fn => (...argsCb) => {
  const len = argsCb.length - 1;
  const callback = argsCb[len];
  const args = argsCb.slice(0, len);
  return fn(args, callback);
};

// Wrap function adding async chain methods
//   fn - <Function>, asynchronous
//   args - <Array>, its arguments
const asAsync = (fn, ...args) => {
  const wrapped = fn.bind(null, ...args);
  for (const name in asyncChainMethods) {
    const method = asyncChainMethods[name];
    wrapped[name] = (...args) => asAsync(method(wrapped, ...args));
  }
  return wrapped;
};

// Applicative f => a -> f a
//   args - <Array>
const of = (...args) => asAsync(callback => callback(null, ...args));

// Monoid m => a -> a -> a
//   fn1 - <Function>
//   fn2 - <Function>
const concat = (fn1, fn2) =>
  toAsync((args1, callback) =>
    fn1(...args1, (err, ...args2) => {
      if (err !== null) callback(err);
      else fn2(...args2, callback);
    })
  );

// Functor f => (a -> b) -> f a -> f b
//   fn1 - <Function>
//   f - <Function>
const fmap = (fn1, f) => {
  const fn2 = toAsync((args, callback) => of(f(...args))(callback));
  return concat(fn1, fn2);
};

// Applicative f => f (a -> b) -> f a -> f b
//   fn - <Function>
//   funcA - <Function>
const ap = (fn, funcA) => concat(funcA, (f, callback) => fmap(fn, f)(callback));

asyncChainMethods = { fmap, ap, concat };

module.exports = {
  toAsync,
  asAsync,
  of,
  concat,
  fmap,
  ap,
};
