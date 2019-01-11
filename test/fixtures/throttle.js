'use strict';

const { asyncIter } = require('../../');

const doSmth = time => {
  const begin = Date.now();
  while (Date.now() - begin < time);
};

const ARRAY_SIZE = 1000;
const TIMER_TIME = 10;
const ITEM_TIME = 1;
const EXPECTED_PERCENT = 0.7;

let sum = 0;
const arr = new Array(ARRAY_SIZE).fill(1);

const iter = asyncIter(arr)
  .map(number => {
    doSmth(ITEM_TIME);
    sum += number;
  })
  .throttle(EXPECTED_PERCENT);

const timer = setInterval(() => doSmth(TIMER_TIME), 0);

(async () => {
  const begin = Date.now();
  await iter.toArray();
  const allTime = Date.now() - begin;

  clearInterval(timer);

  const mapTime = ARRAY_SIZE * ITEM_TIME;
  const actualPercent = mapTime / allTime;

  const actualDeviation = Math.abs(actualPercent - EXPECTED_PERCENT);
  process.send({ actualDeviation, sum, ARRAY_SIZE });
})();
