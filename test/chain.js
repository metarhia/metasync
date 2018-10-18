'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('for.map', test => {
  const data = [1, 2, 3, 4];
  const expected = [2, 4, 6, 8];
  const fn = (item, callback) => process.nextTick(() => {
    callback(null, item * 2);
  });
  metasync
    .for(data)
    .map(fn)
    .fetch((error, result) => {
      test.error(error);
      test.strictSame(result, expected);
      test.end();
    });
});

metatests.test('for chain sync', test => {
  metasync
    .for([1, 2, 3, 4])
    .filter((item, cb) => cb(null, item % 2 === 0))
    .map((item, cb) => cb(null, item * 2))
    .reduce((a, b, cb) => cb(null, a + b))
    .fetch((error, result) => {
      test.error(error);
      test.strictSame(result, 12); // 2 * 2 + 4 * 2
      test.end();
    });
});

metatests.test('for chain async', test => {
  metasync
    .for([1, 2, 3, 4])
    .filter((item, cb) => process.nextTick(cb, null, item % 2 === 0))
    .map((item, cb) => process.nextTick(cb, null, item * 2))
    .reduce((a, b, cb) => process.nextTick(cb, null, a + b))
    .fetch((error, result) => {
      test.error(error);
      test.strictSame(result, 12); // 2 * 2 + 4 * 2
      test.end();
    });
});

metatests.test('for chain error', test => {
  metasync
    .for([1, 2, 3, 4])
    .filter((item, cb) => cb(null, item % 2 === 0))
    .map((item, cb) => cb(new Error('Something happens')))
    .reduce((a, b, cb) => cb(null, a + b))
    .fetch((error, result) => {
      test.strictSame(error instanceof Error, true);
      test.strictSame(result, undefined);
      test.end();
    });
});

metatests.test('for chain after fetch', test => {
  metasync
    .for([1, 2, 3, 4])
    .map((item, cb) => cb(null, item * item))
    .filter((item, cb) => cb(null, item > 5))
    .fetch((error, result, resume) => {
      test.error(error);
      test.strictSame(result, [9, 16]);
      resume(null, result);
    })
    .filter((item, cb) => {
      cb(null, item > 10);
    })
    .map((item, cb) => {
      cb(null, --item);
    })
    .fetch((error, result) => {
      test.error(error);
      test.strictSame(result, [15]);
      test.end();
    });
});

metatests.test('for chain all methods', test => {
  metasync
    .for([1, 2, 3, 4])
    .concat([8, 6, 7])
    .slice(1)
    .sort()
    .reverse()
    .shift()
    .unshift(10)
    .pop()
    .push(11)
    .fetch((error, result, resume) => {
      test.error(error);
      const expected = [10, 7, 6, 4, 3, 11];
      test.strictSame(result, expected);
      resume(null, result);
    })
    .includes(6)
    .fetch((error, result, resume) => {
      test.error(error);
      test.strictSame(result, true);
      resume(null, [6, 8]);
    })
    .includes(7)
    .fetch((error, result) => {
      test.error(error);
      test.strictSame(result, false);
      test.end();
    });
});
