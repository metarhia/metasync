'use strict';

module.exports = (api) => {

  api.metasync.monad = {};

  api.metasync.monad.toAsync = (
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
  const toAsync = api.metasync.monad.toAsync;

  const asyncChainMethods = ['fmap', 'ap', 'concat'];
  api.metasync.monad.asAsync = (
    fn, // async function
    ...args // its argumants
  ) => {
    const asAsync = api.metasync.monad.asAsync;
    const wrapped = fn.bind(null, ...args);
    let methodName;
    for (methodName of asyncChainMethods) {
      const method = api.metasync.monad[methodName];
      wrapped[methodName] = (...args) => asAsync(method(wrapped, ...args));
    }
    return wrapped;
  };
  const asAsync = api.metasync.monad.asAsync;

  // pure :: Applicative f => a -> f a
  api.metasync.monad.of = (...args) => (
    asAsync(callback => callback(null, ...args))
  );
  const of = api.metasync.monad.of;

  // concat :: Monoid m => a -> a -> a
  api.metasync.monad.concat = (fn1, fn2) => toAsync(
    (args1, callback) => fn1(...args1, (err, ...args2) => {
      if (err !== null) callback(err);
      else fn2(...args2, callback);
    })
  );
  const concat = api.metasync.monad.concat;

  // fmap :: Functor f => (a -> b) -> f a -> f b
  api.metasync.monad.fmap = (fn1, f) => {
    const fn2 = toAsync((args, callback) => of(f(...args))(callback));
    return concat(fn1, fn2);
  };
  const fmap = api.metasync.monad.fmap;

  // <*> :: Applicative f => f (a -> b) -> f a -> f b
  api.metasync.monad.ap = (fn, funcA) => (
    concat(funcA, (f, callback) => fmap(fn, f)(callback))
  );

};
