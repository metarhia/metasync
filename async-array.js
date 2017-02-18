'use strict';

const arrayUtils = require('./array-utils');

class AsyncArray {
  constructor(array) {
    this._promise = Promise.resolve(array);
  }

  then(fn) {
    return this._promise.then(fn);
  }  // eslint-disable-line brace-style
  // (^ probably a bug in ESLint)

  catch(fn) {
    return this._promise.catch(fn);
  }

  map(fn) {
    this._update((array, resolve, reject) => {
      arrayUtils.map(array, fn, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    return this;
  }

  filter(fn) {
    this._update((array, resolve) => {
      arrayUtils.filter(array, fn, (result) => {
        resolve(result);
      });
    });
    return this;
  }

  reduce(fn, initial) {
    this._update((array, resolve, reject) => {
      arrayUtils.reduce(array, fn, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }, initial);
    });
    return this._promise;
  }

  each(fn) {
    this._update((array, resolve, reject) => {
      arrayUtils.each(array, fn, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    return this._promise;
  }

  series(fn) {
    this._update((array, resolve, reject) => {
      arrayUtils.series(array, fn, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    return this._promise;
  }

  find(fn) {
    this._update((array, resolve) => {
      arrayUtils.find((array, fn, (result) => {
        resolve(result);
      }));
    });
    return this._promise;
  }

  _update(fn) {
    this._promise = this._promise.then((array) => (
      new Promise((resolve, reject) => {
        fn(array, resolve, reject);
      })
    ));
  }
}

module.exports = AsyncArray;
