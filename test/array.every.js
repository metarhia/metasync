'use strict';

const tap = require('tap');
const metasync = require('..');

function identity(x, callback) {
  callback(null, x);
}

function strictSameResult(input, expectedResult, test, done) {
  metasync.every(input, identity, (err, result) => {
    test.error(err);
    test.strictSame(result, expectedResult);

    done();
  });
}

function fewStrictSameResult(inOutPairs, test) {
  let i = 0;
  const testsEnd = metasync.collect(inOutPairs.length);
  testsEnd.done(() =>  test.end());
  const cb = () => testsEnd.pick('item' + i++);
  for (const [input, output] of inOutPairs) {
    strictSameResult(input, output, test, cb);
  }
}

tap.test('every with error', test => {
  const data = [1, 2, 3];
  const everyErr = new Error('Every error');

  function predicate(item, callback) {
    process.nextTick(() => (
      item % 2 === 0 ? callback(everyErr) : callback(null, true)
    ));
  }

  metasync.every(data, predicate, err => {
    test.strictSame(err, everyErr);
    test.end();
  });
});

tap.test('every with empty array', test => (
  strictSameResult([], true, test, () => test.end())
));

tap.test('every with one-element arrays', test =>
  fewStrictSameResult([ [[false], false], [[true], true] ], test)
);

tap.test('every with two-element arrays', test =>
  fewStrictSameResult([
    [[false, false], false],
    [[false, true ], false],
    [[true,  false], false],
    [[true,  true ], true ],
  ], test)
);

tap.test('every', test => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  function predicate(item, callback) {
    process.nextTick(() => callback(null, item > 0));
  }

  metasync.every(data, predicate, (err, result) => {
    test.error(err);
    test.strictSame(result, true);
    test.end();
  });
});
