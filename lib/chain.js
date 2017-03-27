'use strict';

module.exports = (api) => {

  const resolver = (resolve, reject) => (
    (err, result) => {
      if (err) reject(err);
      else resolve(result);
    }
  );

  class ArrayChain {

    constructor(array) {
      this.promise = Promise.resolve(array);
    }

    then(fn) {
      return this.promise.then(fn);
    }

    catch(fn) {
      return this.promise.catch(fn);
    }

    map(fn) {
      this.chain((array, resolve, reject) => {
        api.metasync.map(array, fn, resolver(resolve, reject));
      });
      return this;
    }

    filter(fn) {
      this.chain((array, resolve) => {
        api.metasync.filter(array, fn, result => resolve(result));
      });
      return this;
    }

    reduce(fn, initial) {
      this.chain((array, resolve, reject) => {
        api.metasync.reduce(array, fn, resolver(resolve, reject), initial);
      });
      return this.promise;
    }

    each(fn) {
      this.chain((array, resolve, reject) => {
        api.metasync.each(array, fn, resolver(resolve, reject));
      });
      return this.promise;
    }

    series(fn) {
      this.chain((array, resolve, reject) => {
        api.metasync.series(array, fn, resolver(resolve, reject));
      });
      return this.promise;
    }

    find(fn) {
      this.chain((array, resolve) => {
        api.metasync.find(array, fn, result => resolve(result));
      });
      return this.promise;
    }

    chain(fn) {
      this.promise = this.promise.then((array) => (
        new Promise((resolve, reject) => fn(array, resolve, reject))
      ));
    }

  }

  api.metasync.for = (
    // Create an ArrayChain instance
    array  // an array or a promise that resolves to an array
  ) => (
    new ArrayChain(array)
  );

};
