'use strict';

api.metatests.test('map', (test) => {
  const data = [1, 2, 3, 4];
  const expected = [2, 4, 6, 8];
  const fn = (item, callback) => process.nextTick(() => {
    callback(null, item * 2);
  });

  api.metasync.for(data).map(fn).fetch((err, result) => {
    if (err) test.notOk(err.toString(), 'must not return an error');
    //test.error(err, 'must not return an error');
    test.strictSame(result, expected, `result should be: ${expected}`);
    test.end();
  });
});
