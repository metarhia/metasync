'use strict';

api.metatests.test('successfull with initial', (test) => {
  const arr = [1, 2, 3, 4, 5];
  const initial = 10;
  const expectedRes = 25;

  api.metasync.reduce(arr, (prev, cur, callback) => (
    process.nextTick(() => callback(null, prev + cur))
  ), (err, res) => {
    if (err) test.notOk(err.toString());
    //test.error(err);
    test.strictSame(res, expectedRes);
    test.end();
  }, initial);
});

api.metatests.test('reduce with initial and empty array', (test) => {
  const arr = [];
  const initial = 10;
  const expectedRes = 10;

  api.metasync.reduce(arr, (prev, cur, callback) => (
    process.nextTick(() => callback(null, prev + cur))
  ), (err, res) => {
    if (err) test.notOk(err.toString());
    //test.error(err);
    test.strictSame(res, expectedRes);
    test.end();
  }, initial);
});

api.metatests.test('reduce without initial and with empty array', (test) => {
  const arr = [];
  const expectedError = new TypeError(
    'Reduce of empty array with no initial value'
  );

  api.metasync.reduce(arr, (prev, cur, callback) => (
    process.nextTick(() => callback(null, prev + cur))
  ), (err, res) => {
    test.strictSame(err, expectedError);
    test.strictSame(res, undefined);
    test.end();
  });
});

api.metatests.test('successfull without initial', (test) => {
  const arr = [1, 2, 3, 4, 5];
  const expectedRes = 15;

  api.metasync.reduce(arr, (prev, cur, callback) => (
    process.nextTick(() => callback(null, prev + cur))
  ), (err, res) => {
    if (err) test.notOk(err.toString());
    //test.error(err);
    test.strictSame(res, expectedRes);
    test.end();
  });
});

api.metatests.test('successfull with asymetric function', (test) => {
  const arr = '10110011';
  const expectedRes = 179;

  api.metasync.reduce(arr, (prev, cur, callback) => (
    process.nextTick(() => callback(null, prev * 2 + +cur))
  ), (err, res) => {
    if (err) test.notOk(err.toString());
    //test.error(err);
    test.strictSame(res, expectedRes);
    test.end();
  });
});

api.metatests.test('with error', (test) => {
  const arr = '10120011';
  const reduceError = new Error('Reduce error');

  api.metasync.reduce(arr, (prev, cur, callback) => process.nextTick(() => {
    const digit = +cur;
    if (digit > 1) {
      callback(reduceError);
      return;
    }
    callback(null, prev * 2 + digit);
  }), (err, res) => {
    test.strictSame(err, reduceError);
    test.strictSame(res, undefined);
    test.end();
  });
});
