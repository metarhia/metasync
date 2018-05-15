'use strict';

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

api.metatests.test('two successful functions', (test) => {
  api.metasync.concat(asyncDataCb, asyncTwice)((err, res) => {
    if (err) test.notOk(err.toString());
    //test.error(err);
    test.strictSame(res, 'datadata');
    test.end();
  });
});

api.metatests.test('first function error', (test) => {
  api.metasync.concat(asyncErrorCb, asyncTwice)((err, res) => {
    test.strictSame(err, asyncError);
    test.strictSame(res, undefined);
    test.end();
  });
});

api.metatests.test('second function error', (test) => {
  api.metasync.concat(asyncDataCb, asyncTransformErrorCb)((err, res) => {
    test.strictSame(err, asyncError);
    test.strictSame(res, undefined);
    test.end();
  });
});
