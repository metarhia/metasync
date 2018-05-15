'use strict';

api.metatests.test('of test', (test) => {
  const args = [1, 2, 3, 4, 5];
  api.metasync.of(...args)((err, ...argsCb) => {
    test.error(err);
    test.strictSame(args, argsCb);
    test.end();
  });
});
