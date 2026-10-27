'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('of test', (test) => {
  const args = [1, 2, 3, 4, 5];
  const ofAsync = metasync.of(...args);
  ofAsync((err, ...argsCb) => {
    test.error(err);
    test.strictSame(args, argsCb);
    test.end();
  });
});
