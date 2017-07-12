'use strict';

const tap = require('tap');
const metasync = require('..');

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

tap.test('Result transformation', (test) => {
  const expected = 'data:';
  metasync.fmap(asyncDataCb, appendColon)((err, res) => {
    test.error(err);
    test.strictSame(expected, res);
    test.end();
  });
});

tap.test('Getting asynchronous error', (test) => {
  metasync.fmap(asyncErrorCb, appendColon)((err, res) => {
    test.strictSame(err, asyncError);
    test.strictSame(res, undefined);
    test.end();
  });
});

tap.test('Getting error with no second argument execution', (test) => {
  let executed = false;
  metasync.fmap(asyncErrorCb, (str) => {
    executed = true;
    return appendColon(str);
  })(() => {
    test.strictSame(executed, false);
    test.end();
  });
});


tap.test('functor law I', (test) => {
  metasync.fmap(asyncDataCb, identity)((err, res) => {
    test.error(err);
    test.strictSame(asyncData, res);
    test.end();
  });
});

tap.test('functor law II', (test) => {
  const fmap = metasync.fmap;
  const asyncTwice = fmap(asyncDataCb, repeatStringTwice);
  const asyncTwiceAndColon = fmap(asyncTwice, appendColon);

  asyncTwiceAndColon((err1, res1) => {
    fmap(asyncDataCb, twiceAndColon)((err2, res2) => {
      test.error(err1, err2);
      test.strictSame(res1, res2);
      test.end();
    });
  });
});
