'use strict';

module.exports = (api) => {
  api.metasync.monad = {};

  api.metasync.monad.toAsync = (
    // Transforms function with args arguments and callback
    // to function with args as separate values and callback
    func // func(args, callback)
         //   args - arguments array
         //   callback - callback
    // returns function with arguments gathered from
    //   args as separate values and callback
  ) => (...argsCb) => {
    const len = argsCb.length - 1;
    const callback = argsCb[len];
    const args = argsCb.slice(0, len);
    return func(args, callback);
  };
  const toAsync = api.metasync.monad.toAsync;

  const asyncChainMethods = ['fmap', 'ap', 'concat'];
  api.metasync.monad.asAsync = (asyncFn, ...args) => {
    const asAsync = api.metasync.monad.asAsync;
    const wrappedAsyncFn = asyncFn.bind(null, ...args);
    let methodName;
    for (methodName of asyncChainMethods) {
      const method = api.metasync.monad[methodName];
      wrappedAsyncFn[methodName] = (...args) =>
        asAsync(method(wrappedAsyncFn, ...args));
    }
    return wrappedAsyncFn;
  };
  const asAsync = api.metasync.monad.asAsync;

  // pure :: Applicative f => a -> f a
  api.metasync.monad.of = (...args) => (
    asAsync(callback => callback(null, ...args))
  );
  const of = api.metasync.monad.of;

  // concat :: Monoid m => a -> a -> a
  api.metasync.monad.concat = (fn1, fn2) => toAsync((args1, callback) =>
    fn1(...args1, (err, ...args2) => {
      if (err !== null) {
        callback(err);
      } else {
        fn2(...args2, callback);
      }
    })
  );
  const concat = api.metasync.monad.concat;

  // fmap :: Functor f => (a -> b) -> f a -> f b
  api.metasync.monad.fmap = (asyncFn1, f) => {
    const asyncFn2 = toAsync((args, callback) => of(f(...args))(callback));
    return concat(asyncFn1, asyncFn2);
  };
  const fmap = api.metasync.monad.fmap;

  // <*> :: Applicative f => f (a -> b) -> f a -> f b
  api.metasync.monad.ap = (asyncFn, funcA) => (
    concat(funcA, (f, callback) => fmap(asyncFn, f)(callback))
  );

};
