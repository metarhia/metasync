'use strict';

const tap = require('tap');
const metasync = require('..');

const asyncArgs = (callback) => (
  process.nextTick(() => callback(null, 4, 5))
);
const functionInCallback = (callback) => (
  process.nextTick(() => callback(null, (x, y) => (x + y)))
);
const asyncError = new Error('Async error');
const asyncErrorCb = (callback) => (
  process.nextTick(() => callback(asyncError))
);

tap.test('two successful functions', (test) => {
  metasync.ap(asyncArgs, functionInCallback)((err, res) => {
    test.error(err);
    test.strictSame(res, 9);
    test.end();
  });
});

tap.test('first function with error', (test) => {
  metasync.ap(asyncErrorCb, functionInCallback)((err, res) => {
    test.strictSame(err, asyncError);
    test.strictSame(res, undefined);
    test.end();
  });
});

tap.test('second function with error', (test) => {
  metasync.ap(asyncArgs, asyncErrorCb)((err, res) => {
    test.strictSame(err, asyncError);
    test.strictSame(res, undefined);
    test.end();
  });
});
