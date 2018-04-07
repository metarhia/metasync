'use strict';

const metasync = require('..');

const q = metasync
  .queue(3)
  .priority()
  .lifo()
  .process((item, cb) => {
    console.dir(item);
    setTimeout(cb, 100);
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
