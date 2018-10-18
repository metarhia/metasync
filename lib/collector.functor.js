'use strict';

const TYPE_ERROR = 'Metasync: Collect unexpected type';
const COLLECT_TIMEOUT = 'Metasync: Collector timed out';

// Collector instance constructor
//   expected - number or array of string, count or keys
// Returns: functor, collector
const collect = expected => {
  const isCount = typeof expected === 'number';
  const isKeys = Array.isArray(expected);
  if (!(isCount || isKeys)) throw new TypeError(TYPE_ERROR);
  let keys = null;
  if (isKeys) {
    keys = new Set(expected);
    expected = expected.length;
  }
  let count = 0;
  let timer = null;
  let onDone = null;
  let isDistinct = false;
  let isDone = false;
  const data = {};

  const collector = (key, err, value) => {
    if (isDone) return collector;
    if (!isDistinct || !(key in data)) {
      if (!isCount && !keys.has(key)) return collector;
      count++;
    }
    if (err) {
      collector.finalize(err, data);
      return collector;
    }
    data[key] = value;
    if (expected === count) {
      if (timer) clearTimeout(timer);
      collector.finalize(null, data);
    }
    return collector;
  };

  const methods = {
    pick: (key, value) => collector(key, null, value),
    fail: (key, err) => collector(key, err),

    take: (key, fn, ...args) => {
      fn(...args, (err, data) => collector(key, err, data));
      return collector;
    },

    timeout: msec => {
      if (msec) {
        timer = setTimeout(() => {
          const err = new Error(COLLECT_TIMEOUT);
          collector.finalize(err, data);
        }, msec);
        timer.unref();
      }
      return collector;
    },

    // callback - function, (error, data)
    done: callback => {
      onDone = callback;
      return collector;
    },

    finalize: (err, data) => {
      if (isDone) return collector;
      isDone = true;
      if (onDone) onDone(err, data);
      return collector;
    },

    distinct: (value = true) => {
      isDistinct = value;
      return collector;
    },
  };

  return Object.assign(collector, methods);
};

module.exports = { collect };
