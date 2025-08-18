'use strict';

class Future {
  constructor(executor) {
    this.executor = executor;
  }

  static of(value) {
    return new Future(resolve => resolve(value));
  }

  static err(error) {
    return new Future((resolve, reject) => reject(error));
  }

  chain(fn) {
    return new Future((resolve, reject) =>
      this.run(value => fn(value).run(resolve, reject), error => reject(error))
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

  run(successed, failed) {
    this.executor(successed, failed);
  }

  promise() {
    return new Promise((resolve, reject) => {
      this.run(value => resolve(value), error => reject(error));
    });
  }
}

module.exports = { Future };
