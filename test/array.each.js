'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('successful each', test => {
  const arr = [1, 2, 3, 4];

  const elementsSet = new Set();
  const expectedElementsSet = new Set(arr);

  metasync.each(arr, (el, callback) => process.nextTick(() => {
    elementsSet.add(el);
    callback(null);
  }), err => {
    test.error(err);
    test.strictSame(elementsSet, expectedElementsSet);
    test.end();
  });
});

metatests.test('each with empty array', test => {
  const arr = [];

  const elementsSet = new Set();
  const expectedElementsSet = new Set(arr);

  metasync.each(arr, (el, callback) => process.nextTick(() => {
    elementsSet.add(el);
    callback(null);
  }), err => {
    test.error(err);
    test.strictSame(elementsSet, expectedElementsSet);
    test.end();
  });
});

metatests.test('each with error', test => {
  const arr = [1, 2, 3, 4];
  let count = 0;

  const elementsSet = new Set();
  const expectedElementsCount = 2;
  const eachError = new Error('Each error');

  metasync.each(arr, (el, callback) => process.nextTick(() => {
    elementsSet.add(el);
    count++;
    if (count === expectedElementsCount) {
      callback(eachError);
    } else {
      callback(null);
    }
  }), err => {
    test.strictSame(err, eachError);
    test.strictSame(elementsSet.size, expectedElementsCount);
    test.end();
  });
});
