'use strict';

api.metatests.test('successfull each', (test) => {
  const arr = [1, 2, 3, 4];

  const elementsSet = new Set();
  const expectedElementsSet = new Set(arr);

  api.metasync.each(arr, (el, callback) => process.nextTick(() => {
    elementsSet.add(el);
    callback(null);
  }), (err) => {
    if (err) test.notOk(err.toString());
    //test.error(err);
    test.strictSame(elementsSet, expectedElementsSet);
    test.end();
  });
});

api.metatests.test('each with empty array', (test) => {
  const arr = [];

  const elementsSet = new Set();
  const expectedElementsSet = new Set(arr);

  api.metasync.each(arr, (el, callback) => process.nextTick(() => {
    elementsSet.add(el);
    callback(null);
  }), (err) => {
    if (err) test.notOk(err.toString());
    //test.error(err);
    test.strictSame(elementsSet, expectedElementsSet);
    test.end();
  });
});

api.metatests.test('each with error', (test) => {
  const arr = [1, 2, 3, 4];
  let count = 0;

  const elementsSet = new Set();
  const expectedElementsCount = 2;
  const eachError = new Error('Each error');

  api.metasync.each(arr, (el, callback) => process.nextTick(() => {
    elementsSet.add(el);
    count++;
    if (count === expectedElementsCount) {
      callback(eachError);
    } else {
      callback(null);
    }
  }), (err) => {
    test.strictSame(err, eachError);
    test.strictSame(elementsSet.size, expectedElementsCount);
    test.end();
  });
});
