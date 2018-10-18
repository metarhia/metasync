'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('queue default FIFO', test => {
  const queue = metasync.queue(3).timeout(1);
  const res = [];

  queue.process((item, callback) => {
    process.nextTick(() => {
      res.push(item.id);
      callback();
    });
  });

  queue.drain(() => {
    test.strictSame(res, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    test.end();
  });

  for (let id = 1; id < 10; id++) {
    queue.add({ id });
  }
});

metatests.test('queue FIFO', test => {
  const queue = metasync.queue(3).fifo().timeout(1);
  const res = [];

  queue.process((item, callback) => {
    process.nextTick(() => {
      res.push(item.id);
      callback();
    });
  });

  queue.drain(() => {
    test.strictSame(res, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    test.end();
  });

  for (let id = 1; id < 10; id++) {
    queue.add({ id });
  }
});

metatests.test('queue LIFO', test => {
  const queue = metasync.queue(3).lifo().timeout(1);
  const res = [];

  queue.process((item, callback) => {
    process.nextTick(() => {
      res.push(item.id);
      callback();
    });
  });

  queue.drain(() => {
    test.strictSame(res, [1, 2, 3, 9, 8, 7, 6, 5, 4]);
    test.end();
  });

  for (let id = 1; id < 10; id++) {
    queue.add({ id });
  }
});

metatests.test('queue priority', test => {
  const queue = metasync.queue(3).priority();
  const res = [];

  queue.process((item, callback) => {
    process.nextTick(() => {
      res.push(item.id);
      callback();
    });
  });

  queue.drain(() => {
    test.strictSame(res, [1, 2, 3, 8, 5, 4, 7, 9, 6]);
    test.end();
  });

  queue.add({ id: 1 }, 1);
  queue.add({ id: 2 }, 4);
  queue.add({ id: 3 }, 5);
  queue.add({ id: 4 }, 7);
  queue.add({ id: 5 }, 8);
  queue.add({ id: 6 }, 2);
  queue.add({ id: 7 }, 6);
  queue.add({ id: 8 }, 9);
  queue.add({ id: 9 }, 3);
});

metatests.test('queue round robin', test => {
  const queue = metasync.queue(3).roundRobin();
  const res = [];

  queue.process((item, callback) => {
    process.nextTick(() => {
      res.push(item.id);
      callback();
    });
  });

  queue.drain(() => {
    test.strictSame(res, [1, 2, 3, 4, 7, 5, 8, 6, 9]);
    test.end();
  });

  queue.add({ id: 1 }, 5);
  queue.add({ id: 2 }, 5);
  queue.add({ id: 3 }, 5);
  queue.add({ id: 4 }, 5);
  queue.add({ id: 5 }, 5);
  queue.add({ id: 6 }, 5);
  queue.add({ id: 7 }, 2);
  queue.add({ id: 8 }, 2);
  queue.add({ id: 9 }, 2);
});

metatests.test('queue round robin with priority', test => {
  const queue = metasync.queue(3).roundRobin().priority();
  const res = [];

  queue.process((item, callback) => {
    process.nextTick(() => {
      res.push(item.id);
      callback();
    });
  });

  queue.drain(() => {
    test.strictSame(res, [1, 2, 3, 4, 8, 9, 7, 5, 6]);
    test.end();
  });

  queue.add({ id: 1 }, 1,  0);
  queue.add({ id: 2 }, 1,  0);
  queue.add({ id: 3 }, 1, 10);
  queue.add({ id: 4 }, 1, 20);
  queue.add({ id: 5 }, 2,  0);
  queue.add({ id: 6 }, 2,  0);
  queue.add({ id: 7 }, 2, 10);
  queue.add({ id: 8 }, 2, 20);
  queue.add({ id: 9 }, 3,  0);
});
