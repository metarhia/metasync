'use strict';

const metasync = require('..');

const q = metasync
  .queue(3)
  .roundRobin()
  .process((item, cb) => {
    console.dir(item);
    setTimeout(cb, 100);
  });

q.add({ id: 1 }, 1, 10);
q.add({ id: 2 }, 2, 10);
q.add({ id: 3 }, 3, 10);
q.add({ id: 4 }, 4, 20);
q.add({ id: 5 }, 1, 10);
q.add({ id: 6 }, 2, 10);
q.add({ id: 7 }, 3, 10);
q.add({ id: 8 }, 4, 50);
q.add({ id: 9 }, 2, 50);
q.add({ id: 10 }, 2, 60);
q.add({ id: 11 }, 2, 70);
q.add({ id: 12 }, 2, 80);
q.add({ id: 13 }, 2, 90);
q.add({ id: 14 }, 2, 60);
q.add({ id: 15 }, 2, 70);
q.add({ id: 16 }, 1, 80);
q.add({ id: 17 }, 1, 90);
q.add({ id: 18 }, 1, 60);
q.add({ id: 19 }, 1, 70);
q.add({ id: 20 }, 1, 80);
q.add({ id: 21 }, 1, 90);
q.add({ id: 22 }, 1, 60);
q.add({ id: 23 }, 1, 70);
