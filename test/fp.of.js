'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('of test', (test) => {
  const args = [1, 2, 3, 4, 5];
  metasync.of(...args)((err, ...argsCb) => {
    test.error(err);
    test.strictSame(args, argsCb);
    test.end();
  });
});
