'use strict';

const metasync = require('..');
const metatests = require('metatests');

const Q1_DELAY_MS = 50;
const Q2_WAIT_MS = 100;
const Q2_TIMEOUT_MS = 200;
const Q2_DELAY_MS = 90;

metatests.test('priority / pipe', (test) => {
  const expectedResult = [2, 8, 6, 4];
  const result = [];

  const q1 = metasync
    .queue(3)
    .priority()
    .process((item, cb) => {
      const err = item.id % 2 ? new Error('unexpected') : null;
      setTimeout(cb, Q1_DELAY_MS, err, item);
    });

  const q2 = metasync
    .queue(1)
    .wait(Q2_WAIT_MS)
    .timeout(Q2_TIMEOUT_MS)
    .priority()
    .process((item, cb) => {
      result.push(item.id);
      setTimeout(cb, Q2_DELAY_MS);
    });

  q1.pipe(q2);

  q2.drain(() => {
    test.strictSame(result, expectedResult);
    test.end();
  });

  q1.add({ id: 1 }, 0);
  q1.add({ id: 2 }, 0);
  q1.add({ id: 3 }, 1);
  q1.add({ id: 4 }, 0);
  q1.add({ id: 5 }, 0);
  q1.add({ id: 6 }, 10);
  q1.add({ id: 7 }, 0);
  q1.add({ id: 8 }, 100);
  q1.add({ id: 9 }, 0);
});
