'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('successful asyncMap with array', test => {
  const arr = [1, 2, 3];
  const expectedArr = [2, 4, 6];

  metasync.asyncMap(
    arr,
    (item, callback) => process.nextTick(() => callback(null, item * 2)),
    (err, newArr) => {
      test.error(err);
      test.strictSame(newArr, expectedArr);
      test.end();
    }
  );
});

metatests.test('successful asyncMap with another iterable', test => {
  const set = new Set([1, 2, 3]);
  const expectedSet = new Set([2, 4, 6]);

  metasync.asyncMap(
    set,
    (item, callback) => process.nextTick(() => callback(null, item * 2)),
    (err, newSet) => {
      test.error(err);
      test.strictSame([...newSet], [...expectedSet]);
      test.end();
    }
  );
});

const doSmth = time => {
  const begin = Date.now();
  while (Date.now() - begin < time);
};

metatests.test('Non-blocking', test => {
  const ITEM_TIME = 1;
  const TIMER_TIME = 9;
  const ARRAY_SIZE = 1000;
  const EXPECTED_PERCENT = 0.5;
  const EXPECTED_DEVIATION = 0.2;

  const arr = new Array(ARRAY_SIZE).fill(1);

  const timer = setInterval(() => doSmth(TIMER_TIME), 1);

  const begin = Date.now();
  metasync.asyncMap(
    arr,
    (x, callback) => {
      doSmth(ITEM_TIME);
      callback();
    },
    { percent: EXPECTED_PERCENT },
    () => {
      clearInterval(timer);

      const mapTime = ITEM_TIME * ARRAY_SIZE;
      const allTime = Date.now() - begin;
      const actualPercent = mapTime / allTime;
      const actualDeviation = Math.abs(actualPercent - EXPECTED_PERCENT);
      test.assert(actualDeviation <= EXPECTED_DEVIATION);
      test.end();
    }
  );
});

metatests.test('asyncMap with not iterable', test => {
  const obj = { a: '1', b: '2', c: '3' };

  test.throws(
    () => metasync.asyncMap(obj, test.mustNotCall(), test.mustNotCall()),
    new TypeError('Base is not Iterable')
  );

  test.end();
});
