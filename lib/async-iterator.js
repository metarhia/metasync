/* eslint-disable no-use-before-define */

'use strict';

const { promisify } = require('util');

const timeout = promisify(res => setTimeout(res, 0));

const toIterator = base => {
  if (base[Symbol.asyncIterator]) {
    return base[Symbol.asyncIterator]();
  } else if (base[Symbol.iterator]) {
    return base[Symbol.iterator]();
  } else {
    throw new TypeError('Base is not Iterable');
  }
};

class AsyncIterator {
  constructor(base) {
    this.base = toIterator(base);
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  async next() {
    return this.base.next();
  }

  async count() {
    let count = 0;
    while (!(await this.next()).done) {
      count++;
    }
    return count;
  }

  async each(fn, thisArg) {
    return this.forEach(fn, thisArg);
  }

  async forEach(fn, thisArg) {
    let next = await this.next();
    while (!next.done) {
      await fn.call(thisArg, next.value);
      next = await this.next();
    }
  }

  async parallel(fn, thisArg) {
    const promises = [];
    let next = await this.next();
    while (!next.done) {
      promises.push(fn.call(thisArg, next.value));
      next = await this.next();
    }
    return Promise.all(promises);
  }

  async every(predicate, thisArg) {
    let next = await this.next();
    while (!next.done) {
      if (!(await predicate.call(thisArg, next.value))) {
        return false;
      }
      next = await this.next();
    }
    return true;
  }

  async find(predicate, thisArg) {
    let next = await this.next();
    while (!next.done) {
      if (await predicate.call(thisArg, next.value)) {
        return next.value;
      }
      next = await this.next();
    }
    return undefined;
  }

  async includes(element) {
    let next = await this.next();
    while (!next.done) {
      const value = next.value;
      if (value === element || (Number.isNaN(value) && Number.isNaN(element))) {
        return true;
      }
      next = await this.next();
    }
    return false;
  }

  async reduce(reducer, initialValue) {
    let result = initialValue;

    if (result === undefined) {
      const next = await this.next();
      if (next.done) {
        throw new TypeError(
          'Reduce of consumed async iterator with no initial value'
        );
      }
      result = next.value;
    }

    let next = await this.next();
    while (!next.done) {
      result = await reducer(result, next.value);
      next = await this.next();
    }
    return result;
  }

  async reduceRight(reducer, initialValue) {
    return this.reverse().reduce(reducer, initialValue);
  }

  async some(predicate, thisArg) {
    let next = await this.next();
    while (!next.done) {
      if (await predicate.call(thisArg, next.value)) {
        return true;
      }
      next = await this.next();
    }
    return false;
  }

  async someCount(predicate, count, thisArg) {
    let n = 0;
    let next = await this.next();
    while (!next.done) {
      if (await predicate.call(thisArg, next.value)) {
        if (++n === count) return true;
      }
      next = await this.next();
    }
    return false;
  }

  async collectTo(CollectionClass) {
    const arr = await this.toArray();
    return new CollectionClass(arr);
  }

  async collectWith(obj, collector) {
    await this.forEach(element => collector(obj, element));
  }

  async join(sep = ',', prefix = '', suffix = '') {
    let result = prefix;
    const { done, value } = await this.next();
    if (!done) {
      result += value;
      let next = await this.next();
      while (!next.done) {
        result += sep + next.value;
        next = await this.next();
      }
    }
    return result + suffix;
  }

  async toArray() {
    const newArray = [];
    let next = await this.next();
    while (!next.done) {
      newArray.push(next.value);
      next = await this.next();
    }
    return newArray;
  }

  map(mapper, thisArg) {
    return new MapIterator(this, mapper, thisArg);
  }

  filter(predicate, thisArg) {
    return new FilterIterator(this, predicate, thisArg);
  }

  flat(depth = 1) {
    return new FlatIterator(this, depth);
  }

  flatMap(mapper, thisArg) {
    return new FlatMapIterator(this, mapper, thisArg);
  }

  zip(...iterators) {
    return new ZipIterator(this, iterators);
  }

  chain(...iterators) {
    return new ChainIterator(this, iterators);
  }

  take(amount) {
    return new TakeIterator(this, amount);
  }

  takeWhile(predicate, thisArg) {
    return new TakeWhileIterator(this, predicate, thisArg);
  }

  skip(amount) {
    for (let i = 0; i < amount; i++) {
      this.next();
    }
    return this;
  }

  throttle(percent, min) {
    return new ThrottleIterator(this, percent, min);
  }

  enumerate() {
    return new EnumerateIterator(this);
  }

  reverse() {
    return new ReverseIterator(this);
  }
}

class MapIterator extends AsyncIterator {
  constructor(base, mapper, thisArg) {
    super(base);
    this.mapper = mapper;
    this.thisArg = thisArg;
  }

  async next() {
    const { done, value } = await this.base.next();
    return {
      done,
      value: done ? undefined : await this.mapper.call(this.thisArg, value),
    };
  }
}

class ReverseIterator extends AsyncIterator {
  constructor(base) {
    super(base);
    this.values = null;
    this.index = null;
  }

  async next() {
    if (!this.values) {
      this.values = await this.base.toArray();
      this.index = this.values.length - 1;
    }

    const index = this.index--;
    if (index === -1) {
      return { done: true, value: undefined };
    } else {
      return { done: false, value: this.values[index] };
    }
  }
}

class FilterIterator extends AsyncIterator {
  constructor(base, predicate, thisArg) {
    super(base);
    this.predicate = predicate;
    this.thisArg = thisArg;
  }

  async next() {
    let next = await this.base.next();
    while (!next.done) {
      if (await this.predicate.call(this.thisArg, next.value)) {
        return { done: false, value: next.value };
      }
      next = await this.base.next();
    }
    return { done: true, value: undefined };
  }
}

class FlatIterator extends AsyncIterator {
  constructor(base, depth) {
    super(base);
    this.currentDepth = 0;
    this.stack = new Array(depth + 1);
    this.stack[0] = base;
  }

  async next() {
    while (this.currentDepth >= 0) {
      const top = this.stack[this.currentDepth];
      const next = await top.next();

      if (next.done) {
        this.stack[this.currentDepth] = null;
        this.currentDepth--;
        continue;
      }

      if (
        this.currentDepth === this.stack.length - 1 ||
        (!next.value[Symbol.iterator] && !next.value[Symbol.asyncIterator])
      ) {
        return next;
      }

      this.stack[++this.currentDepth] = next.value[Symbol.asyncIterator]
        ? next.value[Symbol.asyncIterator]()
        : next.value[Symbol.iterator]();
    }

    return { done: true, value: undefined };
  }
}

class FlatMapIterator extends AsyncIterator {
  constructor(base, mapper, thisArg) {
    super(base);
    this.mapper = mapper;
    this.thisArg = thisArg;
    this.currentIterator = null;
  }

  async next() {
    if (!this.currentIterator) {
      const next = await this.base.next();
      if (next.done) {
        return next;
      }

      const value = this.mapper.call(this.thisArg, next.value);
      if (!value[Symbol.iterator] && !value[Symbol.asyncIterator]) {
        return { done: false, value };
      }

      this.currentIterator = toIterator(value);
    }

    const next = await this.currentIterator.next();

    if (next.done) {
      this.currentIterator = null;
      return this.next();
    }
    return next;
  }
}

class TakeIterator extends AsyncIterator {
  constructor(base, amount) {
    super(base);
    this.amount = amount;
    this.iterated = 0;
  }

  async next() {
    this.iterated++;
    if (this.iterated <= this.amount) {
      return this.base.next();
    }
    return { done: true, value: undefined };
  }
}

class TakeWhileIterator extends AsyncIterator {
  constructor(base, predicate, thisArg) {
    super(base);
    this.predicate = predicate;
    this.thisArg = thisArg;
    this.done = false;
  }

  async next() {
    if (this.done) return { done: true, value: undefined };
    const next = await this.base.next();
    if (!next.done && (await this.predicate.call(this.thisArg, next.value))) {
      return next;
    }
    this.done = true;
    return { done: true, value: undefined };
  }
}

class ZipIterator extends AsyncIterator {
  constructor(base, iterators) {
    super(base);
    this.iterators = iterators.map(toIterator);
  }

  async next() {
    const result = [];

    const next = await this.base.next();
    if (next.done) {
      return next;
    }
    result.push(next.value);

    for (const iterator of this.iterators) {
      const next = await iterator.next();

      if (next.done) {
        return next;
      }
      result.push(next.value);
    }
    return { done: false, value: result };
  }
}

class ChainIterator extends AsyncIterator {
  constructor(base, iterators) {
    super(base);
    this.currentIterator = base;
    this.iterators = iterators.map(toIterator)[Symbol.iterator]();
  }

  async next() {
    const next = await this.currentIterator.next();
    if (!next.done) {
      return next;
    }
    const iterator = this.iterators.next();
    if (iterator.done) {
      return iterator;
    }
    this.currentIterator = iterator.value;
    return this.next();
  }
}

class EnumerateIterator extends AsyncIterator {
  constructor(base) {
    super(base);
    this.index = 0;
  }

  async next() {
    const next = await this.base.next();
    if (next.done) {
      return next;
    }
    return { done: false, value: [this.index++, next.value] };
  }
}

class ThrottleIterator extends AsyncIterator {
  constructor(base, percent = 0.7, min = 5) {
    super(base);
    this.min = min;
    this.ratio = percent / (1 - percent);

    this.sum = 0;
    this.iterCount = 0;
    this.begin = Date.now();
    this.iterMax = this.min;
  }

  async next() {
    if (this.iterMax > this.iterCount) {
      this.iterCount++;
      return this.base.next();
    }

    this.sum += Date.now() - this.begin;
    const itemTime = this.sum / this.iterCount;

    this.begin = Date.now();
    await timeout();
    const loopTime = Date.now() - this.begin;

    const number = Math.max((this.ratio * loopTime) / itemTime, this.min);

    this.iterMax = Math.round(number) + this.iterCount;

    this.iterCount++;
    this.begin = Date.now();
    return this.base.next();
  }
}

// Create an AsyncIterator instance
//   base - <Iterable> | <AsyncIterable>, an iterable
//       that is wrapped in <AsyncIterator>
//
// Returns: <AsyncIterator>
const asyncIter = base => new AsyncIterator(base);

module.exports = { asyncIter, AsyncIterator };
