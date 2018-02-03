'use strict';

const metasync = require('..');
const metatests = require('metatests');

const asyncSum = (x, y, callback) =>
  process.nextTick(() => callback(null, x + y));
const tripleFnInCb = callback =>
  process.nextTick(() => callback(null, x => x * 3));
const asyncMultBy11 = (x, callback) =>
  process.nextTick(() => callback(null, x * 11));

metatests.test('functorify all methods test', test => {
  // prettier-ignore
  metasync
    .functorify(asyncSum, 3, 5)
    .concat(asyncMultBy11)
    .map(x => x * 7)
    .ap(tripleFnInCb)((err, res) => {
      test.error(err);
      test.strictSame(res, (3 + 5) * 7 * 3 * 11);
      test.end();
    });
});
