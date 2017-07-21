'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('flow with parallel flow', (test) => {
  const data = { test: 'data' };
  const expectedData = { test: 'data', fn1: 'data 1', fn2: 'data 2' };

  function fn1(data, cb) {
    process.nextTick(() => cb(null, 'data 1'));
  }

  function fn2(data, cb) {
    process.nextTick(() => cb(null, 'data 2'));
  }

  const fc = metasync.flow([[fn1, fn2]]);
  fc(data, (err, data) => {
    test.error(err);
    test.strictSame(data, expectedData);
    test.end();
  });
});

tap.test('parallel with error', (test) => {
  const parallelError = new Error('Parallel error');

  function fn1(data, cb) {
    process.nextTick(() => cb(null, 'data 1'));
  }

  function fn2(data, cb) {
    process.nextTick(() => cb(parallelError));
  }

  metasync.parallel([fn1, fn2], (err, res) => {
    test.strictSame(err, parallelError);
    test.strictSame(res, undefined);
    test.end();
  });
});

tap.test('sequential with error', (test) => {
  const sequentialError = new Error('Sequential error');
  const expectedDataInFn2 = { fn1: 'data 1' };

  function fn1(data, cb) {
    process.nextTick(() => cb(null, 'data 1'));
  }

  function fn2(data, cb) {
    process.nextTick(() => {
      tap.same(data, expectedDataInFn2);
      cb(sequentialError);
    });
  }

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

  function fn1(data, cb) {
    process.nextTick(() => {
      tap.strictSame(data, expectedDataInFn1);
      cb(null, 'data 1');
    });
  }

  function fn2(data, cb) {
    process.nextTick(() => {
      test.strictSame(data, expectedDataInFn2);
      cb(null, 'data 2');
    });
  }

  function fn3(cb) {
    process.nextTick(() => {
      cb(null, 'data 3');
    });
  }

  function fn4(cb) {
    process.nextTick(() => {
      cb(null, 'data 4');
    });
  }

  function fn5(data, cb) {
    process.nextTick(() => {
      test.strictSame(data.fn1, 'data 1');
      test.strictSame(data.fn2, 'data 2');
      test.strictSame(data.fn4, 'data 4');
      cb(null, 'data 5');
    });
  }

  const fc = metasync.flow([fn1, fn2, [[fn3, [fn4, fn5] ]], [], [[ ]] ]);
  fc(data, (err, data) => {
    test.error(err);
    test.strictSame(data, expectedDataInRes);
    test.end();
  });

});

tap.test('flow cancel before start', (test) => {

  let count = 0;

  function fn1(data, cb) {
    count++;
    process.nextTick(() => cb(null, 'data 1'));
  }

  function fn2(data, cb) {
    count++;
    process.nextTick(() => cb(null, 'data 2'));
  }

  function fn3(cb) {
    count++;
    process.nextTick(() => cb(null, 'data 3'));
  }

  function fn4(cb) {
    count++;
    process.nextTick(() => cb(null, 'data 4'));
  }

  const fc = metasync.flow([fn1, [[fn2, fn3]], fn4]);
  fc.cancel();
  fc({}, (err, data) => {
    test.strictSame(data, undefined);
    test.strictSame(count, 0);
    test.end();
  });

});

tap.test('flow cancel in the middle', (test) => {

  let count = 0;
  let finished = 0;

  function fn1(data, cb) {
    count++;
    process.nextTick(() => {
      finished++;
      cb(null, 'data 1');
    });
  }

  function fn2(data, cb) {
    count++;
    setTimeout(() => {
      finished++;
      cb(null, 'data 2');
    }, 200);
  }

  function fn3(cb) {
    count++;
    setTimeout(() => {
      finished++;
      cb(null, 'data 3');
    }, 200);
  }

  function fn4(cb) {
    count++;
    setTimeout(() => {
      finished++;
      cb(null, 'data 4');
    }, 200);
  }

  const fc = metasync.flow([fn1, [[fn2, fn3]], fn4]);
  fc({}, (err, data) => {
    test.strictSame(data, undefined);
    test.strictSame(count, 3);
    test.strictSame(finished, 1);
    test.end();
  });

  setTimeout(() => {
    fc.cancel();
  }, 100);

});

tap.test('flow cancel after end', (test) => {

  let count = 0;

  function fn1(data, cb) {
    count++;
    process.nextTick(() => cb(null, 'data 1'));
  }

  function fn2(data, cb) {
    count++;
    process.nextTick(() => cb(null, 'data 2'));
  }

  function fn3(cb) {
    count++;
    process.nextTick(() => cb(null, 'data 3'));
  }

  function fn4(cb) {
    count++;
    process.nextTick(() => cb(null, 'data 4'));
  }

  const fc = metasync.flow([fn1, [[fn2, fn3]], fn4]);
  fc({}, (err, data) => {
    test.strictSame(data, {
      fn1: 'data 1',
      fn2: 'data 2',
      fn3: 'data 3',
      fn4: 'data 4'
    });
    test.strictSame(count, 4);
    test.end();
  });

  setTimeout(() => {
    fc.cancel();
  }, 100);

});

tap.test('flow to array', (test) => {

  let count = 0;

  function fn1(data, cb) {
    count++;
    process.nextTick(() => cb(null, 'data 1'));
  }

  function fn2(data, cb) {
    count++;
    process.nextTick(() => cb(null, 'data 2'));
  }

  function fn3(cb) {
    count++;
    process.nextTick(() => cb(null, 'data 3'));
  }

  function fn4(cb) {
    count++;
    process.nextTick(() => cb(null, 'data 4'));
  }

  const fc = metasync.flow([fn1, [[fn2, fn3]], fn4]);
  fc(['data 0'], (err, data) => {
    test.strictSame(data, ['data 0', 'data 1', 'data 2', 'data 3', 'data 4']);
    test.strictSame(count, 4);
    test.end();
  });

});
