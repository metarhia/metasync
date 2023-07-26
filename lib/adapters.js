'use strict';

const { Future } = require('./future');

// Convert Promise to callback-last
//   promise <Promise>
//   callback <Function>
const promiseToCallbackLast = (promise) => (callback) => {
  promise.then(
    (value) => {
      callback(null, value);
    },
    (reason) => {
      callback(reason);
    },
  );
};

// Convert Promise-returning to callback-last / error-first contract
//   fn <Function> promise-returning function
//
// Returns: <Function>
const callbackify =
  (fn) =>
  (...args) => {
    const callback = args.pop();
    promiseToCallbackLast(fn(...args))(callback);
  };

// Convert sync function to callback-last / error-first contract
//   fn <Function> regular synchronous function
//
// Returns: <Function> with contract: callback-last / error-first
const asyncify =
  (fn) =>
  (...args) => {
    const callback = args.pop();
    setTimeout(() => {
      let result;
      try {
        result = fn(...args);
      } catch (error) {
        return void callback(error);
      }
      callback(null, result);
    }, 0);
  };

// Convert async function to Promise-returning function
//   fn <Function> callback-last function
//
// Returns: <Function> Promise-returning function
const promisify =
  (fn) =>
  (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

// Convert sync function to Promise object
//   fn <Function> regular synchronous function
//
// Returns: <Function> Promise-returning function
const promisifySync =
  (fn) =>
  (...args) => {
    let result;
    try {
      result = fn(...args);
    } catch (error) {
      return Promise.reject(error);
    }
    return Promise.resolve(result);
  };

// Convert callback contract to Future-returning function
//   fn <Function> callback-last function
//
// Returns: <Function> Future-returning function
const futurify = fn => (...args) =>
  new Future((resolve, reject) => {
    fn(...args, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

module.exports = {
  callbackify,
  asyncify,
  promiseToCallbackLast,
  promisify,
  promisifySync,
  futurify,
};
