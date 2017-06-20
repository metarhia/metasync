'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('firstOf', (test) => {
  const returningFnIndex = 1;
  let dataReturned = false;

  const execUnlessDataReturned = (data) => (callback) => {
    if (dataReturned) {
      callback(null, data);
    } else {
      process.nextTick(execUnlessDataReturned);
    }
  };
  const fn = (i) => (callback) => process.nextTick(() => {
    if (i == returningFnIndex
  });

  const fns = api.common.range(1, 3).map(makeIFn);

  api.metasync.firstOf(fns, (err, data) => {
    test.error(err);
    test.strictSame(data, 'data');
    test.end();
  });
});
