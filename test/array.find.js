'use strict';

api.metatests.test('find with error', (test) => {
  const data = [1, 2, 3];
  const expectedErrorMessage = 'Intentional error';
  const predicate = (item, callback) => process.nextTick(() => {
    if (item % 2 === 0) {
      callback(new Error(expectedErrorMessage));
    } else {
      callback(null, false);
    }
  });

  api.metasync.find(data, predicate, (err) => {
    test.assert(err instanceof Error, 'err must be an instance of Error');
    //test.type(err, 'Error', 'err must be an instance of Error');
    test.strictSame(err.message, expectedErrorMessage);
    test.end();
  });
});

api.metatests.test('find', (test) => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  const expected = 15;
  const predicate = (item, callback) => process.nextTick(() => (
    callback(null, item % 3 === 0 && item % 5 === 0)
  ));

  api.metasync.find(data, predicate, (err, result) => {
    if (err) test.notOk(err.toString(), 'must not return an error');
    //test.error(err, 'must not return an error');
    test.strictSame(result, expected, `result should be: ${expected}`);
    test.end();
  });
});

api.metatests.test('with empty array', (test) => {
  api.metasync.find([], (el, callback) => (
    process.nextTick(() => callback(null, true))
  ), (err, result) => {
    if (err) test.notOk(err.toString());
    //test.error(err);
    test.strictSame(result, undefined);
    test.end();
  });
});

api.metatests.test('with array without element which is searching', (test) => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  api.metasync.find(data, (el, callback) => (
    process.nextTick(() => callback(null, el === 20))
  ), (err, result) => {
    if (err) test.notOk(err.toString());
    //test.error(err);
    test.strictSame(result, undefined);
    test.end();
  });
});
