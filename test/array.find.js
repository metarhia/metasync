'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('find with error', (test) => {
  const data = [1, 2, 3];
  const predicate = (item, callback) => process.nextTick(() => {
    if (item % 2 === 0) {
      callback(new Error('Intentioanal error'));
    } else {
      callback(null, true);
    }
  });

  metasync.find(data, predicate, (err) => {
    test.ok(err, 'err should be initialized');
    test.type(err, 'Error', 'err must be an instance of Error');
    test.end();
  });
});

tap.test('find', (test) => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  const expected = [15];
  const predicate = (item, callback) => process.nextTick(() => {
    callback(null, item % 3 === 0 && item % 5 === 0);
  });

  metasync.find(data, predicate, (err, result) => {
    test.error(err, 'must not return an error');
    test.ok(result, 'result must be initialized');
    test.type(result, 'Array', 'type of result must be array');
    test.strictSame(result.length, expected.length,
      `length of result must be ${expected.length}`);
    test.strictSame(result[0], expected[0], `reult should be: ${expected}`);
    test.end();
  });
});
