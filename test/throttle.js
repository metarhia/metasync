'use strict';

api.metatests.test('throttle', (test) => {
  let callCount = 0;

  const fn = (arg1, arg2, ...otherArgs) => {
    test.strictSame(arg1, 'someVal');
    test.strictSame(arg2, 4);
    test.strictSame(otherArgs, []);
    callCount++;
    if (callCount === 2) {
      test.end();
    }
  };

  const throttledFn = api.metasync.throttle(1, fn, 'someVal', 4);

  throttledFn();
  test.strictSame(callCount, 1);
  throttledFn();
  throttledFn();
  test.strictSame(callCount, 1);
});

api.metatests.test('throttle merge args', (test) => {
  let callCount = 0;

  const fn = (arg1, arg2, ...otherArgs) => {
    test.strictSame(arg1, 'someVal');
    test.strictSame(arg2, 4);
    test.strictSame(otherArgs, ['str']);
    callCount++;
    if (callCount === 2) {
      test.end();
    }
  };

  const throttledFn = api.metasync.throttle(1, fn, 'someVal', 4);

  throttledFn('str');
  test.strictSame(callCount, 1);
  throttledFn('str');
  throttledFn('str');
  test.strictSame(callCount, 1);
});

api.metatests.test('throttle without arguments for function', (test) => {
  let callCount = 0;

  const fn = (...args) => {
    test.strictSame(args, []);
    callCount++;
    if (callCount === 2) {
      test.end();
    }
  };

  const throttledFn = api.metasync.throttle(1, fn);

  throttledFn();
  test.strictSame(callCount, 1);
  throttledFn();
  throttledFn();
  test.strictSame(callCount, 1);
});

api.metatests.test('debounce', (test) => {
  let count = 0;

  const fn = (arg1, arg2, ...otherArgs) => {
    test.strictSame(arg1, 'someVal');
    test.strictSame(arg2, 4);
    test.strictSame(otherArgs, []);
    count++;
    test.end();
  };

  const debouncedFn = api.metasync.debounce(1, fn, 'someVal', 4);

  debouncedFn();
  debouncedFn();
  test.strictSame(count, 0);
});

api.metatests.test('debounce without arguments for function', (test) => {
  let count = 0;

  const fn = (...args) => {
    test.strictSame(args, []);
    count++;
    test.end();
  };

  const debouncedFn = api.metasync.debounce(1, fn);

  debouncedFn();
  debouncedFn();
  test.strictSame(count, 0);
});

api.metatests.test('timeout with sync function', (test) => {
  const syncFn = (callback) => callback(null, 'someVal');
  api.metasync.timeout(1, syncFn, (err, res, ...args) => {
    test.error(err);
    test.strictSame(res, 'someVal');
    test.strictSame(args, []);
    test.end();
  });
});

api.metatests.test('timeout', (test) => {
  api.metasync.timeout(10, (callback) => {
    setTimeout(() => {
      callback(null, 'someVal');
    }, 0);
  }, (err, res, ...args) => {
    test.error(err);
    test.strictSame(res, 'someVal');
    test.strictSame(args, []);
    test.end();
  });
});
