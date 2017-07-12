'use strict';

let asyncChainMethods = null;

const toAsync = (
  // Transforms function with args arguments and callback
  // to function with args as separate values and callback
  fn // errback function
  // returns function with arguments gathered from
  //   args as separate values and callback
) => (...argsCb) => {
  const len = argsCb.length - 1;
  const callback = argsCb[len];
  const args = argsCb.slice(0, len);
  return fn(args, callback);
};

const asAsync = (
  fn, // async function
  ...args // its argumants
) => {
  const wrapped = fn.bind(null, ...args);
  for (const name in asyncChainMethods) {
    const method = asyncChainMethods[name];
    wrapped[name] = (...args) => asAsync(method(wrapped, ...args));
  }
  return wrapped;
};

// pure :: Applicative f => a -> f a
const of = (...args) => (
  asAsync(callback => callback(null, ...args))
);

// concat :: Monoid m => a -> a -> a
const concat = (fn1, fn2) => toAsync(
  (args1, callback) => fn1(...args1, (err, ...args2) => {
    if (err !== null) callback(err);
    else fn2(...args2, callback);
  })
);

// fmap :: Functor f => (a -> b) -> f a -> f b
const fmap = (fn1, f) => {
  const fn2 = toAsync((args, callback) => of(f(...args))(callback));
  return concat(fn1, fn2);
};

// <*> :: Applicative f => f (a -> b) -> f a -> f b
const ap = (fn, funcA) => (
  concat(funcA, (f, callback) => fmap(fn, f)(callback))
);

asyncChainMethods = { fmap, ap, concat };

module.exports = {
  toAsync,
  asAsync,
  of,
  concat,
  fmap,
  ap
};
