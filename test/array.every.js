'use strict';

const metasync = require('..');
const metatests = require('metatests');

const identity = (x, callback) => callback(null, x);

const strictSameResult = (input, expectedResult, test, done) => {
  metasync.every(input, identity, (err, result) => {
    test.error(err);
    test.strictSame(result, expectedResult);

    done();
  });
};

const fewStrictSameResult = (inOutPairs, test) => {
  let i = 0;
  const testsEnd = metasync.collect(inOutPairs.length);
  testsEnd.done(() => test.end());
  const cb = () => testsEnd.pick('item' + i++);
  for (const [input, output] of inOutPairs) {
    strictSameResult(input, output, test, cb);
  }
};

metatests.test('every with error', test => {
  const data = [1, 2, 3];
  const everyErr = new Error('Every error');

  const predicate = (item, callback) => {
    process.nextTick(() =>
      item % 2 === 0 ? callback(everyErr) : callback(null, true)
    );
  };

  metasync.every(data, predicate, err => {
    test.isError(err, everyErr);
    test.end();
  });
});

metatests.test('every with empty array', test =>
  strictSameResult([], true, test, () => test.end())
);

metatests.test('every with one-element arrays', test =>
  fewStrictSameResult([[[false], false], [[true], true]], test)
);

metatests.test('every with two-element arrays', test =>
  fewStrictSameResult(
    [
      [[false, false], false],
      [[false, true], false],
      [[true, false], false],
      [[true, true], true],
    ],
    test
  )
);

const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

metatests.test('every', test => {
  const predicate = (item, callback) =>
    process.nextTick(() => callback(null, item > 0));

  metasync.every(arr, predicate, (err, result) => {
    test.error(err);
    test.strictSame(result, true);
    test.end();
  });
});

metatests.test('every with another iterable', test => {
  const set = new Set(arr);

  const predicate = (item, callback) =>
    process.nextTick(() => callback(null, item > 0));

  metasync.every(set, predicate, (err, result) => {
    test.error(err);
    test.strictSame(result, true);
    test.end();
  });
});
