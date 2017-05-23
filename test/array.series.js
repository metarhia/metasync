'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('successfull series', (test) => {
  const arr = [1, 2, 3, 4];
  const expectedElements = arr;
  const elements = [];
  metasync.series(arr, (el, callback) => {
    elements.push(el);
    callback(null);
  }, (err) => {
    test.error(err);
    test.strictSame(elements, expectedElements);
    test.end();
  });
});

tap.test('series with error', (test) => {
  const arr = [1, 2, 3, 4];
  const expectedElements = [1, 2];
  const expectedElementsCount = 2;

  const elements = [];
  let count = 0;
  const seriesError = new Error('seriesError');

  metasync.series(arr, (el, callback) => {
    elements.push(el);
    count++;
    if (count === expectedElementsCount) {
      callback(seriesError);
    } else {
      callback(null);
    }
  }, (err) => {
    test.strictSame(err, seriesError);
    test.strictSame(elements, expectedElements);
    test.end();
  });
});
