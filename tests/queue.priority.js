'use strict';

const metasync = require('..');

const q = metasync.queue(3)
  .priority()
  .process((item, cb) => {
    console.dir(item);
    setTimeout(cb, 100);
  });

q.add({ id: 1 }, 0,   0);
q.add({ id: 2 }, 0,   0);
q.add({ id: 3 }, 0,   1);
q.add({ id: 4 }, 0,   0);
q.add({ id: 5 }, 0,   0);
q.add({ id: 6 }, 0,  10);
q.add({ id: 7 }, 0,   0);
q.add({ id: 8 }, 0, 100);
q.add({ id: 9 }, 0,   0);
