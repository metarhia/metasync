'use strict';

const metasync = require('..');
const metatests = require('metatests');

const asyncData = 'data';
const asyncDataCb = callback =>
  process.nextTick(() => callback(null, asyncData));
const asyncTwice = (str, callback) =>
  process.nextTick(() => callback(null, str + str));
const asyncError = new Error('Async error');
const asyncErrorCb = callback =>
  process.nextTick(() => callback(asyncError));
const asyncTransformErrorCb = (str, callback) =>
  process.nextTick(() => callback(asyncError));

metatests.test('two successful functions', test => {
  metasync.concat(asyncDataCb, asyncTwice)((err, res) => {
    test.error(err);
    test.strictSame(res, 'datadata');
    test.end();
  });
});

metatests.test('first function error', test => {
  metasync.concat(asyncErrorCb, asyncTwice)((err, res) => {
    test.strictSame(err, asyncError);
    test.strictSame(res, undefined);
    test.end();
  });
});

metatests.test('second function error', test => {
  metasync.concat(asyncDataCb, asyncTransformErrorCb)((err, res) => {
    test.strictSame(err, asyncError);
    test.strictSame(res, undefined);
    test.end();
  });
});
