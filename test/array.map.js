'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('succesfull map', test => {
  const arr = [1, 2, 3];
  const expectedArr = [1, 4, 9];

  metasync.map(
    arr,
    (x, callback) => process.nextTick(() => callback(null, x * x)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedArr);
      test.end();
    }
  );
});

metatests.test('map with empty array', test => {
  const arr = [];
  const expectedArr = [];

  metasync.map(
    arr,
    (x, callback) => process.nextTick(() => callback(null, x * x)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedArr);
      test.end();
    }
  );
});

metatests.test('map with error', test => {
  const arr = [1, 2, 3];
  const mapError = new Error('Map error');
  let count = 0;

  metasync.map(arr, (x, callback) => process.nextTick(() => {
    count++;
    if (count === 2) {
      callback(mapError);
      return;
    }
    callback(null, x * x);
  }), (err, res) => {
    test.strictSame(err, mapError);
    test.strictSame(res, undefined);
    test.end();
  });
});
