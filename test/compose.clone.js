'use strict';

api.metatests.test('async functions composition clone', (test) => {
  const data = { test: 'data' };
  const expectedData = { test: 'data', data1: 'data 1', data2: 'data 2' };

  function fn1(data, cb) {
    process.nextTick(() => {
      cb(null, { data1: 'data 1' });
    });
  }

  function fn2(data, cb) {
    process.nextTick(() => {
      cb(null, { data2: 'data 2' });
    });
  }

  const fc1 = api.metasync([[fn1, fn2]]);
  const fc2 = fc1.clone();

  fc1(data, (err, data) => {
    if (err) test.notOk(err.toString());
    //test.error(err);
    test.strictSame(data, expectedData);
    fc2(data, (err, data) => {
      if (err) test.notOk(err.toString());
      //test.error(err);
      test.strictSame(data, expectedData);
      test.end();
    });
  });
});
