'use strict';

const metasync = require('..');

const q = metasync.queue(3)
  .factor()
  .process((item, cb) => {
    console.dir(item);
    setTimeout(cb, 100);
  });

q.add({ id: 1 }, 1, 0);
q.add({ id: 2 }, 2, 0);
q.add({ id: 3 }, 3, 0);
q.add({ id: 4 }, 4, 0);
q.add({ id: 5 }, 1, 0);
q.add({ id: 6 }, 2, 0);
q.add({ id: 7 }, 3, 0);
q.add({ id: 8 }, 4, 0);
q.add({ id: 9 }, 2, 0);
q.add({ id: 10 }, 2, 0);
q.add({ id: 11 }, 2, 0);
q.add({ id: 12 }, 2, 0);
q.add({ id: 13 }, 2, 0);
q.add({ id: 14 }, 2, 0);
q.add({ id: 15 }, 2, 0);
q.add({ id: 16 }, 2, 0);
q.add({ id: 17 }, 2, 0);
q.add({ id: 18 }, 2, 0);
q.add({ id: 19 }, 2, 0);
q.add({ id: 20 }, 1, 0);
q.add({ id: 21 }, 1, 0);
q.add({ id: 22 }, 1, 0);
q.add({ id: 23 }, 1, 0);
