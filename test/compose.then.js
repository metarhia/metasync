'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('successful then', test => {
  let finishedFuncsCount = 0;
  const res1 = 'res1';
  const af1 = (data, callback) => process.nextTick(() => {
    test.strictSame(data, {});
    test.strictSame(finishedFuncsCount, 0);
    finishedFuncsCount++;
    callback(null, { res1 });
  });
  const res2 = 'res2';
  const af2 = (data, callback) => process.nextTick(() => {
    test.strictSame(data, { res1 });
    test.strictSame(finishedFuncsCount, 1);
    finishedFuncsCount++;
    callback(null, { res2 });
  });
  const res3 = 'res3';
  const af3 = (data, callback) => process.nextTick(() => {
    const keysCount = Object.keys(data).length;
    test.ok(keysCount >= 2 && keysCount < 4);
    test.ok(finishedFuncsCount >= 2 && finishedFuncsCount < 4);
    finishedFuncsCount++;
    callback(null, { res3 });
  });
  const res4 = 'res4';
  const af4 = (data, callback) => process.nextTick(() => {
    const keysCount = Object.keys(data).length;
    test.ok(keysCount >= 2 && keysCount < 4);
    test.ok(finishedFuncsCount >= 2 && finishedFuncsCount < 4);
    finishedFuncsCount++;
    callback(null, { res4 });
  });
  const faf1 = metasync([af1, [[af2, af3]], af4]);
  faf1().then(res => {
    test.strictSame(res, {
      res1: 'res1',
      res2: 'res2',
      res3: 'res3',
      res4: 'res4',
    });
    test.strictSame(finishedFuncsCount, 4);
    test.end();
  }, err => {
    test.error(err);
  });
});
