'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('succesfull map', test => {
  test.plan(2);

  const arr = [1, 2, 3];
  const expectedArr = [2, 4, 6];

  metasync.asyncMap(
    arr,
    item => item * 2,
    (err, newArr) => {
      test.error(err);
      test.strictSame(newArr, expectedArr);
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
    () => doSmth(ITEM_TIME),
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
