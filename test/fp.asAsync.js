'use strict';

const tap = require('tap');
const metasync = require('..');

const asyncSum = (x, y, callback) => (
  process.nextTick(() => callback(null, x + y))
);
const tripleFnInCb = (callback) => (
  process.nextTick(() => callback(null, x => (x * 3)))
);
const asyncMultBy11 = (x, callback) => (
  process.nextTick(() => callback(null, x * 11))
);

tap.test('asAsync all functions test', (test) => {
  metasync.asAsync(asyncSum, 3, 5)
    .fmap(x => (x * 7))
    .ap(tripleFnInCb)
    .concat(asyncMultBy11)((err, res) => {
      test.error(err);
      test.strictSame(res, 1848);
      test.end();
    });
});
