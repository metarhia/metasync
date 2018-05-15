'use strict';

api.metatests.test('successful some', (test) => {
  const arr = [1, 2, 3];

  const predicate = (x, callback) => callback(null, x % 2 === 0);
  api.metasync.some(arr, predicate, (err, accepted) => {
    if (err) test.notOk(err.toString());
    //test.error(err);
    test.strictSame(accepted, true);
    test.end();
  });
});

api.metatests.test('failing some', (test) => {
  const arr = [1, 2, 3];

  const predicate = (x, callback) => callback(null, x > 3);
  api.metasync.some(arr, predicate, (err, accepted) => {
    if (err) test.notOk(err.toString());
    //test.error(err);
    test.strictSame(accepted, false);
    test.end();
  });
});

api.metatests.test('erroneous some', (test) => {
  const arr = [1, 2, 3];
  const someError = new Error('Some error');

  const predicate = (x, callback) => (
    x % 2 === 0 ? callback(someError) : callback(null, false)
  );
  api.metasync.some(arr, predicate, (err, accepted) => {
    test.strictSame(err, someError);
    test.strictSame(accepted, undefined);
    test.end();
  });
});

api.metatests.test('some with empty array', (test) => {
  const arr = [];

  const predicate = (x, callback) => callback(null, x > 3);
  api.metasync.some(arr, predicate, (err, accepted) => {
    if (err) test.notOk(err.toString());
    //test.error(err);
    test.strictSame(accepted, false);
    test.end();
  });
});
