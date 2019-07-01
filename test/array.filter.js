'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('successful filter', test => {
  const arr = [
    'Lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
  ];
  const expectedArr = [
    'Lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'elit',
    'sed',
    'do',
    'ut',
    'et',
    'magna',
  ];

  metasync.filter(
    arr,
    (str, callback) => process.nextTick(() => callback(null, str.length < 6)),
    (err, res) => {
      test.error(err);
      test.same(res.join(), expectedArr.join());
      test.end();
    }
  );
});

metatests.test('filter with empty array ', test => {
  const arr = [];
  const expectedArr = [];

  metasync.filter(
    arr,
    (str, callback) => process.nextTick(() => callback(null, str.length < 6)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedArr);
      test.end();
    }
  );
});

metatests.test('successful filter with another iterable', test => {
  const set = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const expectedSet = new Set([2, 4, 6, 8, 10]);

  metasync.filter(
    set,
    (x, callback) => process.nextTick(() => callback(null, x % 2 === 0)),
    (err, res) => {
      test.error(err);
      test.strictSame([...res], [...expectedSet]);
      test.end();
    }
  );
});

metatests.test('filter with error', test => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const filterError = new Error('Filter error');

  metasync.filter(
    arr,
    (x, callback) =>
      process.nextTick(() => callback(x === 5 ? filterError : null, x % 2)),
    (err, res) => {
      test.isError(err, filterError);
      test.assertNot(res);
      test.end();
    }
  );
});

metatests.test('filter with not iterable', test => {
  const obj = { a: '1', b: '2', c: '3' };

  test.throws(
    () => metasync.filter(obj, test.mustNotCall(), test.mustNotCall()),
    new TypeError('Base is not Iterable')
  );

  test.end();
});
