'use strict';

const assert = require('assert');
const metasync = require('..');

// TODO(aqrln): test all the methods. Though ArrayChain just wraps
// array-related metasync functions in uniform fashion, and they are covered by
// their own tests (so if they work correctly and a couple of ArrayChain
// methods work properly, all of its methods should do too), extra tests are
// never superfluous.

console.log('Chaining test');

metasync.for([1, 2, 3, 4]).filter((item, cb) => {
  process.nextTick(cb, item % 2 === 0);
}).map((item, cb) => {
  process.nextTick(cb, null, item * 2);
}).reduce((a, b, cb) => {
  process.nextTick(cb, null, a + b);
}).then((result) => {
  console.log('Chaining test done: ' + result);
  assert.strictEqual(result, 12);  // 2 * 2 + 4 * 2
}).catch((error) => {
  const description = error.stack || 'Error: ' + error.toString();
  console.error(description);
  process.exit(1);
});
