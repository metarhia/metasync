'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('firstOf', test => {
  const returningFnIndex = 2;
  let dataReturned = false;

  const execUnlessDataReturned = data => callback => {
    if (dataReturned) {
      callback(null, data);
    } else {
      process.nextTick(execUnlessDataReturned);
    }
  };
  const makeIFn = i => callback => process.nextTick(() => {
    const iData = 'data' + i;
    if (i === returningFnIndex) {
      dataReturned = true;
      callback(null, iData);
    } else {
      execUnlessDataReturned(iData);
    }
  });

  const fns = [1, 2, 3].map(makeIFn);

  metasync.firstOf(fns, (err, data) => {


    test.error(err);
    test.strictSame(data, 'data2');
    test.end();
  });
});

metatests.test('parallel with error', test => {
  const parallelError = new Error('Parallel error');

  const fn1 = (data, cb) => {
    process.nextTick(() => {
      cb(null, { data1: 'data 1' });
    });
  };

  const fn2 = (data, cb) => {
    process.nextTick(() => {
      cb(parallelError);
    });
  };

  metasync.parallel([fn1, fn2], (err, res) => {
    test.strictSame(err, parallelError);
    test.strictSame(res, undefined);
    test.end();
  });
});

metatests.test('sequential with error', test => {
  const sequentialError = new Error('Sequential error');
  const expectedDataInFn2 = { data1: 'data 1' };

  const fn1 = (data, cb) => {
    process.nextTick(() => {
      cb(null, { data1: 'data 1' });
    });
  };

  const fn2 = (data, cb) => {
    process.nextTick(() => {
      test.same(data, expectedDataInFn2);
      cb(sequentialError);
    });
  };

  metasync.sequential([fn1, fn2], (err, res) => {
    test.strictSame(err, sequentialError);
    test.strictSame(res, undefined);
    test.end();
  });
});
