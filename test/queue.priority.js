'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('fifo / priority', test => {
  const expectedResult = [1, 2, 3, 8, 6, 4, 5, 7, 9];
  const result = [];

  const q = metasync
    .queue(3)
    .priority()
    .process((item, cb) => {
      result.push(item.id);
      setTimeout(cb, 100);
    });

  q.drain(() => {
    test.strictSame(result, expectedResult);
    test.end();
  });

  q.add({ id: 1 }, 0);
  q.add({ id: 2 }, 0);
  q.add({ id: 3 }, 1);
  q.add({ id: 4 }, 0);
  q.add({ id: 5 }, 0);
  q.add({ id: 6 }, 10);
  q.add({ id: 7 }, 0);
  q.add({ id: 8 }, 100);
  q.add({ id: 9 }, 0);
});
