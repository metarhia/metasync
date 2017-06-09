'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('some successful', (test) => {
  const asyncFn = (x, callback) => process.nextTick(
    () => callback(null, x % 3 === 0)
  );
  metasync.some([1, 2, 3], asyncFn, (err, res, ...otherArgs) => {
    test.error(err);
    test.strictSame(res, true);
    test.strictSame(otherArgs, []);
    test.end();
  });
});

tap.test('some fail', (test) => {
  const asyncFn = (x, callback) => process.nextTick(
    () => callback(null, x % 4 === 0)
  );
  metasync.some([1, 2, 3], asyncFn, (err, res, ...otherArgs) => {
    test.error(err);
    test.strictSame(res, false);
    test.strictSame(otherArgs, []);
    test.end();
  });
});

tap.test('some with error', (test) => {
  const someErr = new Error('Some error');
  const asyncFn = (x, callback) => process.nextTick(
    () => (x % 2 === 0 ? callback(someErr) : callback(null, false))
  );
  metasync.some([1, 2, 3], asyncFn, (err, ...otherArgs) => {
    test.strictSame(err, someErr);
    test.strictSame(otherArgs, []);
    test.end();
  });
});

tap.test('some with empty array', (test) => {
  const asyncFn = (x, callback) => process.nextTick(
    () => callback(null, true)
  );
  metasync.some([], asyncFn, (err, res, ...otherArgs) => {
    test.error(err);
    test.strictSame(res, false);
    test.strictSame(otherArgs, []);
    test.end();
  });
});
