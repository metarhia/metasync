'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('firstOf', test => {
  const returningFnIndex = 2;
  let dataReturned = false;

  const execUnlessDataReturned = (data, callback) => {
    if (dataReturned) {
      callback(null, data);
    } else {
      process.nextTick(() => execUnlessDataReturned(data, callback));
    }
  };
  const makeIFn = i => callback =>
    process.nextTick(() => {
      const iData = 'data' + i;
      if (i === returningFnIndex) {
        dataReturned = true;
        callback(null, iData);
      } else {
        execUnlessDataReturned(iData, callback);
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

metatests.test('runIf run asyncFn', test => {
  const asyncFn = test.mustCall((arg1, arg2, cb) => {
    process.nextTick(() => {
      cb(null, { arg1, arg2 });
    });
  });

  metasync.runIf(true, asyncFn, 'val1', 'val2', (err, result) => {
    test.error(err);
    test.strictSame(result, { arg1: 'val1', arg2: 'val2' });
    test.end();
  });
});

metatests.test('runIf do not run asyncFn', test => {
  const asyncFn = test.mustNotCall((arg1, arg2, cb) => {
    process.nextTick(() => {
      cb(null, { arg1, arg2 });
    });
  });

  metasync.runIf(false, asyncFn, 'val1', 'val2', (err, result) => {
    test.error(err);
    test.strictSame(result, undefined);
    test.end();
  });
});

metatests.test('runIf default value', test => {
  const asyncFn = test.mustNotCall((val, cb) => {
    process.nextTick(() => {
      cb(null, val);
    });
  });

  metasync.runIf(false, 'default', asyncFn, 'val', (err, result) => {
    test.error(err);
    test.strictSame(result, 'default');
    test.end();
  });
});

metatests.test('runIf forward an error', test => {
  const asyncFn = test.mustCall(cb => {
    process.nextTick(() => {
      cb(new Error());
    });
  });

  metasync.runIf(true, asyncFn, err => {
    test.isError(err);
    test.end();
  });
});

metatests.test('runIfFn', test => {
  const value = 42;
  const asyncFn = cb => {
    cb(null, value);
  };

  metasync.runIfFn(test.mustCall(asyncFn), (err, res) => {
    test.error(err);
    test.strictSame(res, value);
    test.end();
  });
});

metatests.test('runIfFn without fn', test => {
  metasync.runIfFn(null, (err, res) => {
    test.error(err);
    test.assertNot(res);
    test.end();
  });
});
