'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('flow with parallel flow', (test) => {
  const data = { test: 'data' };
  const expectedData = { test: 'data', fn1: 'data 1', fn2: 'data 2' };

  const fn1 = (data, cb) => process.nextTick(() => {
    cb(null, 'data 1');
  });

  const fn2 = (data, cb) => process.nextTick(() => {
    cb(null, 'data 2');
  });

  const fc = metasync.flow([[fn1, fn2 ]]);
  fc(data, (err, data) => {
    test.error(err);
    test.strictSame(data, expectedData);
    test.end();
  });
});

tap.test('parallel with error', (test) => {
  const parallelError = new Error('Parallel error');

  const fn1 = (data, cb) => process.nextTick(() => {
    cb(null, 'data 1');
  });

  const fn2 = (data, cb) => process.nextTick(() => {
    cb(parallelError);
  });

  metasync.parallel([fn1, fn2 ], (err, res) => {
    test.strictSame(err, parallelError);
    test.strictSame(res, undefined);
    test.end();
  });
});

tap.test('sequential with error', (test) => {
  const sequentialError = new Error('Sequential error');
  const expectedDataInFn2 = { fn1: 'data 1' };

  const fn1 = (data, cb) => process.nextTick(() => {
    cb(null, 'data 1');
  });

  const fn2 = (data, cb) => process.nextTick(() => {
    tap.strictSame(data, expectedDataInFn2);
    cb(sequentialError);
  });

  metasync.sequential([fn1, fn2], (err, res) => {
    test.strictSame(err, sequentialError);
    test.strictSame(res, undefined);
    test.end();
  });
});

tap.test('flow with complex flow', (test) => {
  const data = { test: 'data' };
  const expectedDataInFn1 = { test: 'data' };
  const expectedDataInFn2 = { test: 'data', fn1: 'data 1' };
  const expectedDataInRes = { test: 'data' };
  let i;
  for (i = 1; i < 6; i++) {
    expectedDataInRes['fn' + i] = 'data ' + i;
  }

  const fn1 = (data, cb) => process.nextTick(() => {
    tap.strictSame(data, expectedDataInFn1);
    cb(null, 'data 1');
  });

  const fn2 = (data, cb) => process.nextTick(() => {
    test.strictSame(data, expectedDataInFn2);
    cb(null, 'data 2');
  });

  const fn3 = (cb) => process.nextTick(() => {
    cb(null, 'data 3');
  });

  const fn4 = (cb) => process.nextTick(() => {
    cb(null, 'data 4');
  });

  const fn5 = (data, cb) => process.nextTick(() => {
    test.strictSame(data.fn1, 'data 1');
    test.strictSame(data.fn2, 'data 2');
    test.strictSame(data.fn4, 'data 4');
    cb(null, 'data 5');
  });

  const fc = metasync.flow([fn1, fn2, [[fn3, [fn4, fn5] ]], [], [[ ]] ]);
  fc(data, (err, data) => {
    test.error(err);
    test.strictSame(data, expectedDataInRes);
    test.end();
  });
});
