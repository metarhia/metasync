'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('roundRobin', test => {
  const expectedResult = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    20,
    9,
    21,
    10,
    22,
    11,
    23,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
  ];
  const result = [];

  const q = metasync
    .queue(3)
    .roundRobin()
    .process((item, cb) => {
      result.push(item.id);
      setTimeout(cb, 100);
    });

  q.drain(() => {
    test.strictSame(result, expectedResult);
    test.end();
  });
  q.add({ id: 1 }, 1);
  q.add({ id: 2 }, 2);
  q.add({ id: 3 }, 3);
  q.add({ id: 4 }, 4);
  q.add({ id: 5 }, 1);
  q.add({ id: 6 }, 2);
  q.add({ id: 7 }, 3);
  q.add({ id: 8 }, 4);
  q.add({ id: 9 }, 2);
  q.add({ id: 10 }, 2);
  q.add({ id: 11 }, 2);
  q.add({ id: 12 }, 2);
  q.add({ id: 13 }, 2);
  q.add({ id: 14 }, 2);
  q.add({ id: 15 }, 2);
  q.add({ id: 16 }, 2);
  q.add({ id: 17 }, 2);
  q.add({ id: 18 }, 2);
  q.add({ id: 19 }, 2);
  q.add({ id: 20 }, 1);
  q.add({ id: 21 }, 1);
  q.add({ id: 22 }, 1);
  q.add({ id: 23 }, 1);
});
