'use strict';

class Future {
  constructor(executor) {
    this.executor = executor;
  }

  static of(value) {
    return new Future(resolve => resolve(value));
  }

  chain(fn) {
    return new Future((resolve, reject) =>
      this.fork(
        value => fn(value).fork(resolve, reject),
        error => reject(error)
      )
    );
  }

  map(fn) {
    return this.chain(
      value =>
        new Future((resolve, reject) => {
          try {
            resolve(fn(value));
          } catch (error) {
            reject(error);
          }
        })
    );
  }

  fork(successed, failed) {
    this.executor(successed, failed);
  }

  promise() {
    return new Promise((resolve, reject) => {
      this.fork(value => resolve(value), error => reject(error));
    });
  }
}

module.exports = { Future };
