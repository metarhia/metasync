'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('flow clone', (test) => {
  const data = { test: 'data' };
  const expectedData = { test: 'data', fn1: 'data 1', fn2: 'data 2' };

  function fn1(data, cb) {
    process.nextTick(() => cb(null, 'data 1'));
  }

  function fn2(data, cb) {
    process.nextTick(() => cb(null, 'data 2'));
  }

  const fc1 = metasync.flow([[fn1, fn2]]);
  const fc2 = fc1.clone();

  fc1(data, (err, data) => {
    test.error(err);
    test.strictSame(data, expectedData);
    data.fn1 = '';
    data.fn2 = '';
    fc2(data, (err, data) => {
      test.error(err);
      test.strictSame(data, expectedData);
      test.end();
    });
  });
});
