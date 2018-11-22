'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('succesfull map', test => {
  test.plan(2);

  const arr = [1, 2, 3];
  const expectedArr = [2, 4, 6];

  metasync.asyncMap(arr, item => item * 2, (err, newArr) => {
    test.error(err);
    test.strictSame(newArr, expectedArr);
  });
});

const doSmth = time => {
  const begin = Date.now();
  while (Date.now() - begin < time);
};

metatests.test('Non-blocking', test => {
  const ARRAY_SIZE = 1000;
  const MIN_IO_CALLS = 90;
  const MAX_IO_CALLS = 110;

  let ioCallsCount = 0;
  const arr = new Array(ARRAY_SIZE).fill(1);

  const timer = setInterval(() => {
    doSmth(9);
    ioCallsCount++;
  }, 1);

  metasync.asyncMap(arr, () => doSmth(1),
    { percent: 0.5 }, () => {
      clearInterval(timer);
      test.assert(ioCallsCount >= MIN_IO_CALLS);
      test.assert(ioCallsCount <= MAX_IO_CALLS);
      test.end();
    });
});

