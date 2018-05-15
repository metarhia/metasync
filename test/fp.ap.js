'use strict';

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

api.metatests.test('two successful functions', (test) => {
  api.metasync.ap(asyncArgs, functionInCallback)((err, res) => {
    test.error(err);
    test.strictSame(res, 9);
    test.end();
  });
});

api.metatests.test('first function with error', (test) => {
  api.metasync.ap(asyncErrorCb, functionInCallback)((err, res) => {
    test.strictSame(err, asyncError);
    test.strictSame(res, undefined);
    test.end();
  });
});

api.metatests.test('second function with error', (test) => {
  api.metasync.ap(asyncArgs, asyncErrorCb)((err, res) => {
    test.strictSame(err, asyncError);
    test.strictSame(res, undefined);
    test.end();
  });
});
