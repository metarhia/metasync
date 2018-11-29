'use strict';

const metasync = require('../../');
const common = require('metarhia-common');
const metatests = require('metatests');

const doSmth = time => {
  const begin = Date.now();
  while (Date.now() - begin < time);
};

metatests.test('Non-blocking', test => {
  const ARRAY_SIZE = 1000;
  const TIMER_TIME = 9;
  const ITEM_TIME = 1;
  const EXPECTED_PERCENT = 0.5;
  const EXPECTED_DEVIATION = 0.2;

  const numbers = new metasync.AsyncArray(ARRAY_SIZE).fill(1);
  numbers.percent = EXPECTED_PERCENT;

  const timer = setInterval(() => doSmth(TIMER_TIME), 1);

  const nodeVerion = common.between(process.version, 'v', '.');

  const iter = nodeVerion >= 10 ?
    require('./for-await.js') :
    require('./for-promise.js');

  async function iterFunc() {
    const begin = Date.now();
    const sum = await iter(numbers, doSmth);
    const allTime = Date.now() - begin;

    const mapTime = ARRAY_SIZE * ITEM_TIME;
    const actualPercent = mapTime / allTime;
    const actualDeviation = Math.abs(actualPercent - EXPECTED_PERCENT);

    clearInterval(timer);
    test.strictSame(sum, ARRAY_SIZE);
    test.assert(actualDeviation <= EXPECTED_DEVIATION);
    test.end();
  }

  iterFunc();
});
