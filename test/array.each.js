'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('successful each', test => {
  const arr = [1, 2, 3, 4];

  const elementsSet = new Set();
  const expectedElementsSet = new Set(arr);

  metasync.each(
    arr,
    (el, callback) =>
      process.nextTick(() => {
        elementsSet.add(el);
        callback(null);
      }),
    err => {
      test.error(err);
      test.strictSame(elementsSet, expectedElementsSet);
      test.end();
    }
  );
});

metatests.test('each with empty array', test => {
  const arr = [];

  const elementsSet = new Set();
  const expectedElementsSet = new Set(arr);

  metasync.each(
    arr,
    (el, callback) =>
      process.nextTick(() => {
        elementsSet.add(el);
        callback(null);
      }),
    err => {
      test.error(err);
      test.strictSame(elementsSet, expectedElementsSet);
      test.end();
    }
  );
});

metatests.test('successful each with another iterable', test => {
  const map = new Map([[1, 'a'], [2, 'b'], [3, 'c']]);
  const mapCopy = new Map();

  metasync.each(
    map,
    (entry, callback) =>
      process.nextTick(() => {
        mapCopy.set(...entry);
        callback(null);
      }),
    err => {
      test.error(err);
      test.strictSame([...mapCopy], [...map]);
      test.end();
    }
  );
});

metatests.test('each with error', test => {
  const arr = [1, 2, 3, 4];
  const eachError = new Error('Each error');

  metasync.each(
    arr,
    (item, callback) =>
      process.nextTick(() => callback(item === 2 ? eachError : null)),
    err => {
      test.isError(err, eachError);
      test.end();
    }
  );
});
