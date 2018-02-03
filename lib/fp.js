'use strict';

// Add functional methods to `fn` and partially apply arguments to it.
// Functional methods are added by replacing prototype of `fn`.
//   fn - <Function> function which functional methods will be added to
//   args - <any[]> arguments which will be partially applied to fn
const functorify = (fn, ...args) => {
  const wrapped = fn.bind(null, ...args);
  Object.setPrototypeOf(wrapped, Functor.prototype);
  return wrapped;
};

// Applicative f => a -> f a
//   args - <Array>
const of = (...args) => functorify(callback => callback(null, ...args));

// Monoid m => m -> m -> m
//   fn1 - <Function>
//   fn2 - <Function>
const concat = (fn1, fn2) => (...args1) => {
  const callback = args1.pop();
  fn1(...args1, (err, ...args2) => {
    if (err !== null) callback(err);
    else fn2(...args2, callback);
  });
};

// Functor f => (a -> b) -> f a -> f b
//   fn1 - <Function>
//   f - <Function>
const fmap = (fn1, f) => {
  const fn2 = (...args) => {
    const callback = args.pop();
    of(f(...args))(callback);
  };
  return concat(fn1, fn2);
};

// Applicative f => f (a -> b) -> f a -> f b
//   fn - <Function>
//   funcA - <Function>
const ap = (fn, funcA) => concat(funcA, (f, callback) => fmap(fn, f)(callback));

function Functor() {}

const FP_FUNCTION_METHODS = {
  map: fmap,
  concat,
  ap,
};
for (const methodName in FP_FUNCTION_METHODS) {
  const method = FP_FUNCTION_METHODS[methodName];
  Functor.prototype[methodName] = function(...args) {
    return functorify(method(this, ...args));
  };
}

module.exports = {
  of,
  concat,
  fmap,
  ap,
  functorify,
};
