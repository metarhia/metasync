'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('simple poolify', (test) => {

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

tap.test('simple poolify', (test) => {

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
