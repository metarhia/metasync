'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('poolify simple', (test) => {

  const buffer = () => new Uint32Array(128);
  const expectedItem = buffer();

  const pool = metasync.poolify(buffer, 0, 2, 4);

  pool(item1 => {
    test.strictSame(item1, expectedItem);
    pool(item2 => {
      test.strictSame(item2, expectedItem);
      pool(item1);
      pool(item2);
      test.assert(pool(), 'Must have 2 items in a pool');
      test.assert(pool(), 'Must have 2 items in a pool');
      test.end();
    });
  });
});

metatests.test('poolify loop', (test) => {

  const buffer = () => new Uint32Array(128);
  const expectedItem = buffer();

  const pool = metasync.poolify(buffer, 10, 15, 20);

  for (let i = 0; i < 15; i++) {
    test.strictSame(pool(), expectedItem);
  }
  test.end();
});

metatests.test('poolify max', (test) => {

  const buffer = () => new Uint32Array(128);
  const expectedItem = buffer();

  const pool = metasync.poolify(buffer, 5, 7, 10);

  for (let i = 0; i < 15; i++) {
    pool(item => {
      test.strictSame(item, expectedItem);
      setTimeout(() => {
        pool(item);
        if (i === 14) test.end();
      }, 1);
    });
  }
});

metatests.test('poolify delayed order', (test) => {

  const buffer = () => new Uint32Array(128);
  const expectedItem = buffer();

  const pool = metasync.poolify(buffer, 0, 2, 2);

  let get3 = false;
  pool(item1 => {
    test.strictSame(item1, expectedItem);
    pool(item2 => {
      test.strictSame(item2, expectedItem);
      test.assertNot(pool());
      pool(item3 => {
        test.strictSame(item3, expectedItem);
        test.strictSame(get3, false);
        get3 = true;
      });
      pool(item4 => {
        test.strictSame(item4, expectedItem);
        test.strictSame(get3, true);
        test.end();
      });
      pool(item1);
      pool(item2);
    });
  });

});
