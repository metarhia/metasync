'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('poolify simple', test => {

  const buffer = () => new Uint32Array(128);

  const pool = metasync.poolify(buffer, 10, 15, 20);

  pool(item1 => {
    test.strictSame(pool.items.length, 14);
    test.strictSame(item1.length, 128);
    pool(item2 => {
      test.strictSame(pool.items.length, 13);
      test.strictSame(item2.length, 128);
      pool([item1]);
      pool([item2]);
      test.strictSame(pool.items.length, 15);
      test.end();
    });
  });

});

metatests.test('poolify loop', test => {

  const buffer = () => new Uint32Array(128);

  const pool = metasync.poolify(buffer, 10, 15, 20);

  for (let i = 0; i < 15; i++) {
    pool(item => {
      pool([item]);
      if (i === 14) {
        test.strictSame(item.length, 128);
        test.end();
      }
    });
  }

});

metatests.test('poolify max', test => {

  const buffer = () => new Uint32Array(128);

  const pool = metasync.poolify(buffer, 5, 7, 10);

  for (let i = 0; i < 15; i++) {
    pool(item => {
      setTimeout(() => {
        pool([item]);
        if (i === 14) {
          test.end();
        }
      }, 100);
    });
  }

});

metatests.test('poolify delayed order', test => {

  const buffer = () => new Uint32Array(128);

  const pool = metasync.poolify(buffer, 0, 2, 2);

  let get3 = false;
  pool(item1 => {
    test.strictSame(pool.items.length, 1);
    pool(item2 => {
      test.strictSame(pool.items.length, 0);
      pool(item3 => {
        test.strictSame(pool.items.length, 0);
        test.strictSame(get3, false);
        get3 = true;
        pool([item3]);
      });
      pool(item4 => {
        test.strictSame(pool.items.length, 1);
        test.strictSame(get3, true);
        pool([item4]);
        test.end();
      });
      pool([item1]);
      pool([item2]);
    });
  });

});

metatests.test('poolify functor', test => {

  const adder = a => b => adder(a + b);

  const pool = metasync.poolify(adder, 1, 2, 3);

  pool(item1 => {
    test.strictSame(pool.items.length, 1);
    pool(item2 => {
      test.strictSame(pool.items.length, 0);
      pool([item1]);
      pool([item2]);
      test.strictSame(pool.items.length, 2);
      test.end();
    });
  });

});

metatests.test('poolify get sync', test => {

  const adder = a => b => adder(a + b);

  const pool = metasync.poolify(adder, 1, 2, 3);

  const item1 = pool();
  test.strictSame(pool.items.length, 1);
  const item2 = pool();
  test.strictSame(pool.items.length, 0);
  const item3 = pool();
  test.strictSame(pool.items.length, 0);
  const item4 = pool();
  test.strictSame(item4, undefined);
  test.strictSame(pool.items.length, 0);
  pool([item1]);
  pool([item2]);
  pool([item3]);
  test.strictSame(pool.items.length, 3);
  test.end();

});
