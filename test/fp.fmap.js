'use strict';

const asyncData = 'data';
const asyncDataCb = (callback) => process.nextTick(() => {
  callback(null, asyncData);
});
const asyncError = new Error('Async error');
const asyncErrorCb = (callback) => process.nextTick(() => {
  callback(asyncError);
});
const identity = x => x;
const repeatStringTwice = (str) => (str + str);
const appendColon = (str) => (str + ':');
const twiceAndColon = (str) => appendColon(repeatStringTwice(str));

api.metatests.test('Result transformation', (test) => {
  const expected = 'data:';
  api.metasync.fmap(asyncDataCb, appendColon)((err, res) => {
    test.error(err);
    test.strictSame(expected, res);
    test.end();
  });
});

api.metatests.test('Getting asynchronous error', (test) => {
  api.metasync.fmap(asyncErrorCb, appendColon)((err, res) => {
    test.strictSame(err, asyncError);
    test.strictSame(res, undefined);
    test.end();
  });
});

const FP1 = 'Getting error with no second argument execution';
api.metatests.test(FP1, (test) => {
  let executed = false;
  api.metasync.fmap(asyncErrorCb, (str) => {
    executed = true;
    return appendColon(str);
  })(() => {
    test.strictSame(executed, false);
    test.end();
  });
});

api.metatests.test('functor law I', (test) => {
  api.metasync.fmap(asyncDataCb, identity)((err, res) => {
    test.error(err);
    test.strictSame(asyncData, res);
    test.end();
  });
});

api.metatests.test('functor law II', (test) => {
  const fmap = api.metasync.fmap;
  const asyncTwice = fmap(asyncDataCb, repeatStringTwice);
  const asyncTwiceAndColon = fmap(asyncTwice, appendColon);

  asyncTwiceAndColon((err1, res1) => {
    fmap(asyncDataCb, twiceAndColon)((err2, res2) => {
      test.error(err1);
      test.error(err2);
      test.strictSame(res1, res2);
      test.end();
    });
  });
});
