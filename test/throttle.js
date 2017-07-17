'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('throttle', (test) => {
  let callCount = 0;
  const throttledFn = metasync.throttle(1, (arg1, arg2, ...otherArgs) => {
    test.strictSame(arg1, 'someVal');
    test.strictSame(arg2, 4);
    test.strictSame(otherArgs, []);
    callCount++;
    if (callCount === 2) {
      test.end();
    }
  }, ['someVal', 4]);

  throttledFn();
  test.strictSame(callCount, 1);
  throttledFn();
  throttledFn();
  test.strictSame(callCount, 1);
});

tap.test('throttle without arguments for function', (test) => {
  let callCount = 0;
  const throttledFn = metasync.throttle(1, (...args) => {
    test.strictSame(args, []);
    callCount++;
    if (callCount === 2) {
      test.end();
    }
  });

  throttledFn();
  test.strictSame(callCount, 1);
  throttledFn();
  throttledFn();
  test.strictSame(callCount, 1);
});

tap.test('debounce', (test) => {
  let count = 0;
  const debouncedFn = metasync.debounce(1, (arg1, arg2, ...otherArgs) => {
    test.strictSame(arg1, 'someVal');
    test.strictSame(arg2, 4);
    test.strictSame(otherArgs, []);
    count++;
    test.end();
  }, ['someVal', 4]);

  debouncedFn();
  debouncedFn();
  test.strictSame(count, 0);
});

tap.test('debounce without arguments for function', (test) => {
  let count = 0;
  const debouncedFn = metasync.debounce(1, (...args) => {
    test.strictSame(args, []);
    count++;
    test.end();
  });

  debouncedFn();
  debouncedFn();
  test.strictSame(count, 0);
});

tap.test('timeout with sync function', (test) => {
  const syncFn = (callback) => callback(null, 'someVal');
  metasync.timeout(1, syncFn, (err, res, ...args) => {
    test.error(err);
    test.strictSame(res, 'someVal');
    test.strictSame(args, []);
    test.end();
  });
});

tap.test('timeout', (test) => {
  metasync.timeout(10, (callback) => {
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
