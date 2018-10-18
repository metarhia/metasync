'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('find with error', test => {
  const data = [1, 2, 3];
  const expectedErrorMessage = 'Intentional error';
  const predicate = (item, callback) => process.nextTick(() => {
    if (item % 2 === 0) {
      callback(new Error(expectedErrorMessage));
    } else {
      callback(null, false);
    }
  });

  metasync.find(data, predicate, err => {
    test.type(err, 'Error', 'err must be an instance of Error');
    test.strictSame(err.message, expectedErrorMessage);
    test.end();
  });
});

metatests.test('find', test => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  const expected = 15;
  const predicate = (item, callback) => process.nextTick(() =>
    callback(null, item % 3 === 0 && item % 5 === 0)
  );

  metasync.find(data, predicate, (err, result) => {
    test.error(err, 'must not return an error');
    test.strictSame(result, expected, `result should be: ${expected}`);
    test.end();
  });
});

metatests.test('with empty array', test => {
  metasync.find(
    [],
    (el, callback) => process.nextTick(() => callback(null, true)),
    (err, result) => {
      test.error(err);
      test.strictSame(result, undefined);
      test.end();
    }
  );
});

metatests.test('with array without element which is searching', test => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  metasync.find(
    data,
    (el, callback) => process.nextTick(() => callback(null, el === 20)),
    (err, result) => {
      test.error(err);
      test.strictSame(result, undefined);
      test.end();
    }
  );
});
