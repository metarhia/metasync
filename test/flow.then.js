'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('successfull then', (test) => {
  let finishedFuncsCount = 0;
  const res1 = 'res1';
  function af1(data, callback) {
    return process.nextTick(() => {
      test.strictSame(data, {});
      test.strictSame(finishedFuncsCount, 0);
      finishedFuncsCount++;
      callback(null, { res1 });
    });
  }
  const res2 = 'res2';
  function af2(data, callback) {
    return process.nextTick(() => {
      test.strictSame(data, { res1 });
      test.strictSame(finishedFuncsCount, 1);
      finishedFuncsCount++;
      callback(null, { res2 });
    });
  }
  const res3 = 'res3';
  function af3(data, callback) {
    return process.nextTick(() => {
      const keysCount = Object.keys(data).length;
      test.ok(keysCount >= 2 && keysCount < 4);
      test.ok(finishedFuncsCount >= 2 && finishedFuncsCount < 4);
      finishedFuncsCount++;
      callback(null, { res3 });
    });
  }
  const res4 = 'res4';
  function af4(data, callback) {
    return process.nextTick(() => {
      const keysCount = Object.keys(data).length;
      test.ok(keysCount >= 2 && keysCount < 4);
      test.ok(finishedFuncsCount >= 2 && finishedFuncsCount < 4);
      finishedFuncsCount++;
      callback(null, { res4 });
    });
  }
  const faf1 = metasync([af1, [[af2, af3]], af4]);
  faf1.then((res) => {
    test.strictSame(res, {
      res1: 'res1',
      res2: 'res2',
      res3: 'res3',
      res4: 'res4',
    });
    test.strictSame(finishedFuncsCount, 4);
    test.end();
  }, (err) => {
    test.error(err);
  });
});
