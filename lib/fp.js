'use strict';

let asyncChainMethods = null;

// Transforms function with args arguments and callback
// to function with args as separate values and callback
//   fn - function, callback-last / err-first
// Returns: function
const toAsync = fn => (...argsCb) => {
  const len = argsCb.length - 1;
  const callback = argsCb[len];
  const args = argsCb.slice(0, len);
  return fn(args, callback);
};

const asAsync = (
  fn, // function, asynchronous
  ...args // array, its argumants
) => {
  const wrapped = fn.bind(null, ...args);
  for (const name in asyncChainMethods) {
    const method = asyncChainMethods[name];
    wrapped[name] = (...args) => asAsync(method(wrapped, ...args));
  }
  return wrapped;
};

const of = (
  // Hint: pure :: Applicative f => a -> f a
  ...args // array
) => asAsync(callback => callback(null, ...args));

const concat = (
  // Hint: concat :: Monoid m => a -> a -> a
  fn1, // function
  fn2 // function
) => toAsync(
  (args1, callback) => fn1(...args1, (err, ...args2) => {
    if (err !== null) callback(err);
    else fn2(...args2, callback);
  })
);

const fmap = (
  // Hint: fmap :: Functor f => (a -> b) -> f a -> f b
  fn1, // function
  f // function
) => {
  const fn2 = toAsync((args, callback) => of(f(...args))(callback));
  return concat(fn1, fn2);
};

const ap = (
  // Apply
  // Hint: <*> :: Applicative f => f (a -> b) -> f a -> f b
  fn, // function
  funcA // function
) => concat(funcA, (f, callback) => fmap(fn, f)(callback));

asyncChainMethods = { fmap, ap, concat };

module.exports = {
  toAsync,
  asAsync,
  of,
  concat,
  fmap,
  ap,
};
