'use strict';

const { promisify } = require('util');

const timeout = promisify(resolve => setTimeout(resolve, 0));

class AsyncArray extends Array {
  constructor(...args) {
    super(...args);

    this.min = 5;
    this.ratio = 1.5;
  }

  set percent(value) {
    if (value < 1 && value >= 0) {
      this.ratio = value / (1 - value);
    } else {
      throw new Error('The percen must be less than 1 and greater ' +
        'than or equal to 0');
    }
  }

  [Symbol.asyncIterator]() {
    let sum = 0;
    let count = 0;
    let begin = Date.now();
    let iterMax = this.min;

    const getItem = () => {
      const done = count >= this.length;
      const value = done ? undefined : this[count];
      count++;
      return { value, done };
    };

    async function next() {
      if (iterMax - count > 0) return getItem();

      sum += Date.now() - begin;
      const itemTime = sum / count;

      begin = Date.now();
      await timeout();
      const loopTime = Date.now() - begin;

      const number = Math.max(this.ratio * loopTime / itemTime, this.min);

      iterMax = Math.min(Math.round(number) + count, this.length);

      begin = Date.now();
      return getItem();
    }

    return { next: next.bind(this) };
  }
}

module.exports = { AsyncArray };

