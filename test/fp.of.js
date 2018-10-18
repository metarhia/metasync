'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('of test', test => {
  const args = [1, 2, 3, 4, 5];
  metasync.of(...args)((err, ...argsCb) => {
    test.error(err);
    test.strictSame(args, argsCb);
    test.end();
  });
});
