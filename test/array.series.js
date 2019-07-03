'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('successful series', test => {
  const arr = [1, 2, 3, 4];
  const expectedElements = arr;
  const elements = [];

  metasync.series(
    arr,
    (el, callback) => {
      elements.push(el);
      callback(null);
    },
    err => {
      test.error(err);
      test.strictSame(elements, expectedElements);
      test.end();
    }
  );
});

metatests.test('successful series with another iterable', test => {
  const set = new Set([1, 2, 3, 4]);
  const expectedElements = set;
  const elements = [];

  metasync.series(
    set,
    (el, callback) => {
      elements.push(el);
      callback(null);
    },
    err => {
      test.error(err);
      test.strictSame(elements, [...expectedElements]);
      test.end();
    }
  );
});

metatests.test('series with error', test => {
  const arr = [1, 2, 3, 4];
  const expectedElements = [1, 2];
  const expectedElementsCount = 2;

  const elements = [];
  let count = 0;
  const seriesError = new Error('seriesError');

  metasync.series(
    arr,
    (el, callback) => {
      elements.push(el);
      count++;
      if (count === expectedElementsCount) {
        callback(seriesError);
      } else {
        callback(null);
      }
    },
    err => {
      test.isError(err, seriesError);
      test.strictSame(elements, expectedElements);
      test.strictSame(count, expectedElementsCount);
      test.end();
    }
  );
});
