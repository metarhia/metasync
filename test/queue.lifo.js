'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('lifo / simple', (test) => {
  const expectedResult = [1, 2, 3, 9, 8, 7, 6, 5, 4];
  const result = [];

  const q = metasync
    .queue(3)
    .priority()
    .lifo()
    .process((item, cb) => {
      result.push(item.id);
      setTimeout(cb, 100);
    });

  q.drain(() => {
    test.strictSame(result, expectedResult);
    test.end();
  });

  q.add({ id: 1 });
  q.add({ id: 2 });
  q.add({ id: 3 });
  q.add({ id: 4 });
  q.add({ id: 5 });
  q.add({ id: 6 });
  q.add({ id: 7 });
  q.add({ id: 8 });
  q.add({ id: 9 });
});
