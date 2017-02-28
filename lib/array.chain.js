'use strict';

const arrayUtils = require('./array.utils');

const metasync = {};
module.exports = metasync;

const resolver = (resolve, reject) => (
  (err, result) => {
    if (err) reject(err);
    else resolve(result);
  }
);

class ArrayChain {

  constructor(array) {
    this._promise = Promise.resolve(array);
  }

  then(fn) {
    return this._promise.then(fn);
  }

  catch(fn) {
    return this._promise.catch(fn);
  }

  map(fn) {
    this._update((array, resolve, reject) => {
      arrayUtils.map(array, fn, resolver(resolve, reject));
    });
    return this;
  }

  filter(fn) {
    this._update((array, resolve) => {
      arrayUtils.filter(array, fn, result => resolve(result));
    });
    return this;
  }

  reduce(fn, initial) {
    this._update((array, resolve, reject) => {
      arrayUtils.reduce(array, fn, resolver(resolve, reject), initial);
    });
    return this._promise;
  }

  each(fn) {
    this._update((array, resolve, reject) => {
      arrayUtils.each(array, fn, resolver(resolve, reject));
    });
    return this._promise;
  }

  series(fn) {
    this._update((array, resolve, reject) => {
      arrayUtils.series(array, fn, resolver(resolve, reject));
    });
    return this._promise;
  }

  find(fn) {
    this._update((array, resolve) => {
      arrayUtils.find(array, fn, result => resolve(result));
    });
    return this._promise;
  }

  _update(fn) {
    this._promise = this._promise.then((array) => (
      new Promise((resolve, reject) => fn(array, resolve, reject))
    ));
  }

}

metasync.for = (
  // Create an ArrayChain instance
  array  // an array or a promise that resolves to an array
) => (
  new ArrayChain(array)
);
