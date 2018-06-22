'use strict';

const identity = (x, callback) => callback(null, x);

const strictSameResult = (input, expectedResult, test, done) => {
  api.metasync.every(input, identity, (err, result) => {
    test.error(err);
    test.strictSame(result, expectedResult);

    done();
  });
};

const fewStrictSameResult = (inOutPairs, test) => {
  let i = 0;
  const testsEnd = api.metasync.collect(inOutPairs.length);
  testsEnd.done(() =>  test.end());
  const cb = () => testsEnd.pick('item' + i++);
  for (const [input, output] of inOutPairs) {
    strictSameResult(input, output, test, cb);
  }
};

api.metatests.test('every with error', test => {
  const data = [1, 2, 3];
  const everyErr = new Error('Every error');

  const predicate = (item, callback) => {
    process.nextTick(() => (
      item % 2 === 0 ? callback(everyErr) : callback(null, true)
    ));
  };

  api.metasync.every(data, predicate, err => {
    test.strictSame(err, everyErr);
    test.end();
  });
});

api.metatests.test('every with empty array', test => (
  strictSameResult([], true, test, () => test.end())
));

api.metatests.test('every with one-element arrays', test =>
  fewStrictSameResult([ [[false], false], [[true], true] ], test)
);

api.metatests.test('every with two-element arrays', test =>
  fewStrictSameResult([
    [[false, false], false],
    [[false, true ], false],
    [[true,  false], false],
    [[true,  true ], true ],
  ], test)
);

api.metatests.test('every', test => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  const predicate = (item, callback) => {
    process.nextTick(() => callback(null, item > 0));
  };

  api.metasync.every(data, predicate, (err, result) => {
    test.error(err);
    test.strictSame(result, true);
    test.end();
  });
});
