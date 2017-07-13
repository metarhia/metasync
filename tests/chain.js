'use strict';

const assert = require('assert');
const metasync = require('..');

// TODO(aqrln): test all the methods. Though ArrayChain just wraps
// array-related metasync functions in uniform fashion, and they are covered by
// their own tests (so if they work correctly and a couple of ArrayChain
// methods work properly, all of its methods should do too), extra tests are
// never superfluous.

metasync
  .for([1, 2, 3, 4])
  .filter((item, cb) => cb(null, item % 2 === 0))
  .map((item, cb) => cb(null, item * 2))
  .reduce((a, b, cb) => cb(null, a + b))
  .fetch((error, result) => {
    if (error) {
      const description = error.stack || 'Error: ' + error.toString();
      console.error(description);
      process.exit(1);
    } else {
      assert.strictEqual(result, 12); // 2 * 2 + 4 * 2
    }
  });

metasync
  .for([1, 2, 3, 4])
  .filter((item, cb) => cb(null, item % 2 === 0))
  .map((item, cb) => cb(new Error('Something happens')))
  .reduce((a, b, cb) => cb(null, a + b))
  .fetch((error) => {
    if (!error) {
      console.log('Chaining test fails');
      process.exit(1);
    }
  });

metasync
  .for([1, 2, 3, 4])
  .filter((item, cb) => process.nextTick(cb, null, item % 2 === 0))
  .map((item, cb) => process.nextTick(cb, null, item * 2))
  .reduce((a, b, cb) => process.nextTick(cb, null, a + b))
  .fetch((error, result) => {
    if (error) {
      const description = error.stack || 'Error: ' + error.toString();
      console.error(description);
      process.exit(1);
    } else {
      assert.strictEqual(result, 12); // 2 * 2 + 4 * 2
    }
  });

metasync
  .for([1, 2, 3, 4])
  .map((item, cb) => cb(null, item * item))
  .filter((item, cb) => cb(null, item > 5))
  .fetch((error, result, resume) => {
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0], 9);
    assert.strictEqual(result[1], 16);
    resume(null, result);
  })
  .filter((item, cb) => {
    cb(null, item > 10);
  })
  .map((item, cb) => {
    cb(null, --item);
  })
  .fetch((error, result) => {
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0], 15);
  });

const arrayEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  let i;
  for (i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
};

metasync
  .for([1, 2, 3, 4])
  .concat([8, 6, 7])
  .slice(1)
  .sort()
  .reverse()
  .shift()
  .unshift(10)
  .pop()
  .push(11)
  .fetch((error, result, resume) => {
    const expected = [10, 7, 6, 4, 3, 11];
    assert.strictEqual(arrayEqual(result, expected), true);
    resume(null, result);
  })
  .includes(6)
  .fetch((error, result, resume) => {
    assert.strictEqual(result, true);
    resume(null, [6, 8]);
  })
  .includes(7)
  .fetch((error, result) => {
    assert.strictEqual(result, false);
  });
