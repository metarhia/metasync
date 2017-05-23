'use strict';

const tap = require('tap');
const metasync = require('..');

const asyncSum = (x, y, callback) => (
  process.nextTick(() => callback(x + y))
);
const tripleFnInCb = (callback) => (
  process.nextTick(() => (x => (x * 3)))
);
const asyncMultBy11 = (x, callback) => (
  process.nextTick(() => callback(x * 11))
);

tap.test('asAsync all functions test', (test) => {
  metasync.monad.asAsync(asyncSum, 4, 5)
      .fmap(x => (x * 7))
      .ap(tripleFnInCb)
      .concat(asyncMultBy11)((err, res) => {
    test.error(err);
    test.strictSame(res, 1540);
    test.end();
  });
});
