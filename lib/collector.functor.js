'use strict';

module.exports = (api) => {

  api.metasync.collect = (
    expected // count or array of string
    // returns: collector functor
  ) => {
    const isCount = typeof(expected) === 'number';
    const isKeys = Array.isArray(expected);
    if (!(isCount || isKeys)) throw new TypeError('Unexpected type');
    let keys = null;
    if (isKeys) {
      keys = new Set(expected);
      expected = expected.length;
    }
    let count = 0;
    let timer = null;
    let done = null;
    let isDistinct = false;
    let isDone = false;
    const data = {};

    const collector = (key, err, value) => {
      if (isDone) return collector;
      if (!isDistinct || !(key in data)) {
        if (!isCount && !keys.has(key)) return;
        count++;
      }
      if (err) return collector.finalize(err, data);
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

      timeout: (msec) => {
        if (msec) {
          timer = setTimeout(() => {
            const err = new Error('Collector timeout');
            collector.finalize(err, data);
          }, msec);
          timer.unref();
        }
        return collector;
      },

      done: (callback) => {
        done = callback;
        return collector;
      },

      finalize: (err, data) => {
        if (isDone) return collector;
        isDone = true;
        if (done) done(err, data);
        return collector;
      },

      distinct: (value = true) => {
        isDistinct = value;
        return collector;
      }
    };

    Object.assign(collector, methods);

    return collector;
  };

};
