'use strict';

// Convert Promise-returning to callback-last / error-first contract
//   fn <Function> promise-returning function
//
// Returns: <Function>
const callbackify = fn => (...args) => {
  const callback = args.pop();
  fn(...args)
    .then(value => {
      callback(null, value);
    })
    .catch(reason => {
      callback(reason);
    });
};

// Convert sync function to callback-last / error-first contract
//   fn <Function> regular synchronous function
//
// Returns: <Function> with contract: callback-last / error-first
const asyncify = fn => (...args) => {
  const callback = args.pop();
  setTimeout(() => {
    try {
      const result = fn(...args);
      if (result instanceof Error) callback(result);
      else callback(null, result);
    } catch (error) {
      callback(error);
    }
  }, 0);
};

// Convert async function to Promise-returning function
//   fn <Function> callback-last function
//
// Returns: <Function> Promise-returning function
const promisify = fn => (...args) => new Promise((resolve, reject) => {
  fn(...args, (err, data) => {
    if (err) reject(err);
    else resolve(data);
  });
});

// Convert sync function to Promise object
//   fn <Function> regular synchronous function
//
// Returns: <Function> Promise-returning function
const promisifySync = fn => (...args) => {
  try {
    const result = fn(...args);
    if (result instanceof Error) return Promise.reject(result);
    else return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  callbackify,
  asyncify,
  promisify,
  promisifySync,
};
