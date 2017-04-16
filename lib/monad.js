'use strict';

module.exports = (api) => {
  api.metasync.monad = {};

  api.metasync.monad.withCb = (
    // Transforms function with args arguments and callback
    // to function with args as separate values and callback
    func // func(args, callback)
         //   args - arguments array
         //   callback - callback
    // returns function with arguments gathered from
    //   args as separate values and callback
  ) => (...argsCb) => {
    const callback = argsCb[argsCb.length - 1];
    const args = argsCb.slice(0, argsCb.length - 1);
    return func(args, callback);
  };
  const { withCb } = api.metasync.monad;

  // pure :: Applicative f => a -> f a
  api.metasync.monad.of = (...args) => callback => callback(null, ...args);
  const { of } = api.metasync.monad;

  // concat :: Monoid m => a -> a -> a
  api.metasync.monad.concat = (fn1, fn2) => withCb((args1, callback) =>
    fn1(...args1, (err, ...args2) => {
      if (err !== null) {
        callback(err);
      } else {
        fn2(...args2, callback);
      }
    })
  );
  const { concat } = api.metasync.monad;

  // fmap :: Functor f => (a -> b) -> f a -> f b
  api.metasync.monad.fmap = (f, asyncFn1) => {
    const asyncFn2 = withCb((args, callback) => of(f(...args))(callback));
    return concat(asyncFn1, asyncFn2);
  };
  const { fmap } = api.metasync.monad;

  // <*> :: Applicative f => f (a -> b) -> f a -> f b
  api.metasync.monad.ap = (funcA, asyncFn) =>
  concat(funcA, (f, callback) => fmap(f, asyncFn)(callback));

};
