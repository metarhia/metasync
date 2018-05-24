'use strict';

const metasync = require('..');

const q1 = metasync
  .queue(3)
  .priority()
  .process((item, cb) => {
    setTimeout(cb, 50, item.id % 2 ? new Error('shit') : null, item);
  });

const q2 = metasync
  .queue(1)
  .wait(100)
  .timeout(200)
  .priority()
  .process((item, cb) => {
    console.dir({ process2: item });
    setTimeout(cb, 90);
  });

q1.pipe(q2);

q1.add({ id: 1 },   0);
q1.add({ id: 2 },   0);
q1.add({ id: 3 },   1);
q1.add({ id: 4 },   0);
q1.add({ id: 5 },   0);
q1.add({ id: 6 },  10);
q1.add({ id: 7 },   0);
q1.add({ id: 8 }, 100);
q1.add({ id: 9 },   0);
