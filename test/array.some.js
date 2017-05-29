'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('successful some', (test) => {
  const arr = [1, 2, 3];

  const predicate = (x, callback) => callback(null, x % 2 === 0);
  metasync.some(arr, predicate, (err, accepted) => {
    test.error(err);
    test.strictSame(accepted, true);
    test.end();
  });
});

tap.test('failing some', (test) => {
  const arr = [1, 2, 3];

  const predicate = (x, callback) => callback(null, x > 3);
  metasync.some(arr, predicate, (err, accepted) => {
    test.error(err);
    test.strictSame(accepted, false);
    test.end();
  });
});

tap.test('erroneous some', (test) => {
  const arr = [1, 2, 3];
  const someError = new Error('Some error');

  const predicate = (x, callback) => (
    x % 2 === 0 ? callback(someError) : callback(null, false)
  );
  metasync.some(arr, predicate, (err, accepted) => {
    test.strictSame(err, someError);
    test.strictSame(accepted, undefined);
    test.end();
  });
});

tap.test('some with empty array', (test) => {
  const arr = [];

  const predicate = (x, callback) => callback(null, x > 3);
  metasync.some(arr, predicate, (err, accepted) => {
    test.error(err);
    test.strictSame(accepted, false);
    test.end();
  });
});
