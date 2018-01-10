'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('poolify simple', (test) => {

  const buffer = () => new Uint32Array(128);

  const pool = metasync.poolify(buffer, 10, 15, 20);

  pool(item1 => {
    test.strictSame(pool.items.length, 14);
    test.strictSame(item1.length, 128);
    pool(item2 => {
      test.strictSame(pool.items.length, 13);
      test.strictSame(item2.length, 128);
      pool(item1);
      pool(item2);
      test.strictSame(pool.items.length, 15);
      test.end();
    });
  });

});

tap.test('poolify loop', (test) => {

  const buffer = () => new Uint32Array(128);

  const pool = metasync.poolify(buffer, 10, 15, 20);

  for (let i = 0; i < 15; i++) {
    pool(item => {
      pool(item);
      if (i === 14) {
        test.strictSame(item.length, 128);
        test.end();
      }
    });
  }

});

tap.test('poolify max', (test) => {

  const buffer = () => new Uint32Array(128);

  const pool = metasync.poolify(buffer, 5, 7, 10);

  for (let i = 0; i < 15; i++) {
    pool(item => {
      setTimeout(() => {
        pool(item);
        if (i === 14) {
          test.end();
        }
      }, 100);
    });
  }

});

tap.test('poolify delayed order', (test) => {

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
        pool(item3);
      });
      pool(item4 => {
        test.strictSame(pool.items.length, 1);
        test.strictSame(get3, true);
        pool(item4);
        test.end();
      });
      pool(item1);
      pool(item2);
    });
  });

});
