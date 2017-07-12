'use strict';

const tap = require('tap');
const metasync = require('..');

const asyncData = 'data';
const asyncDataCb = (callback) => (
  process.nextTick(() => callback(null, asyncData))
);
const asyncTwice = (str, callback) => (
  process.nextTick(() => callback(null, str + str))
);
const asyncError = new Error('Async error');
const asyncErrorCb = (callback) => (
  process.nextTick(() => callback(asyncError))
);
const asyncTransformErrorCb = (str, callback) => (
  process.nextTick(() => callback(asyncError))
);

tap.test('two successful functions', (test) => {
  metasync.concat(asyncDataCb, asyncTwice)((err, res) => {
    test.error(err);
    test.strictSame(res, 'datadata');
    test.end();
  });
});

tap.test('first function error', (test) => {
  metasync.concat(asyncErrorCb, asyncTwice)((err, res) => {
    test.strictSame(err, asyncError);
    test.strictSame(res, undefined);
    test.end();
  });
});

tap.test('second function error', (test) => {
  metasync.concat(asyncDataCb, asyncTransformErrorCb)((err, res) => {
    test.strictSame(err, asyncError);
    test.strictSame(res, undefined);
    test.end();
  });
});
