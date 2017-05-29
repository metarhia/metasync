'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('queue add', (test) => {
  const queue =  new metasync.ConcurrentQueue(3, 2000);
  let taskIndex = 1;

  queue.on('process', (item, callback) => {
    process.nextTick(() => {
      test.strictSame(item, { id: taskIndex });
      taskIndex++;
      callback(null);
    });
  });

  queue.on('empty', () => {
    test.end();
  });

  let id;
  for (id = 1; id < 10; id++) {
    queue.add({ id });
  }
});


tap.test('queue pause resume stop', (test) => {
  const queue =  new metasync.ConcurrentQueue(3);
  queue.pause();
  queue.add({ id: 1 });
  test.strictSame(queue.count, 0);

  let itemIsProcessed = false;
  queue.on('process', (item, callback) => {
    itemIsProcessed = true;
    callback(null);
  });

  queue.next({ id: 2 });
  test.strictSame(itemIsProcessed, false);

  queue.emit('process');
  test.strictSame(itemIsProcessed, false);

  queue.resume();
  test.strictSame(queue.isOnPause, false);

  queue.emit('wrongEvent');

  queue.stop();
  test.strictSame(queue.count, 0);
  test.end();
});

tap.test('queue with no process function and no timeout', (test) => {
  const queue =  new metasync.ConcurrentQueue(3);
  queue.add({ id: 1 });
  queue.add({ id: 2 });
  queue.add({ id: 3 });

  test.strictSame(queue.count, 0);
  test.end();
});

tap.test('queue with timeout event', (test) => {
  const timeoutErr = new Error('ConcurrentQueue timed out');

  const queue =  new metasync.ConcurrentQueue(3, 1);

  queue.on('process', (item, callback) => setTimeout(() => {
    callback(null, item);
  }, 1000));

  queue.on('timeout', (err, res) => {
    test.strictSame(err, timeoutErr);
    test.strictSame(res, undefined);
    test.end();
  });

  queue.add({ id: 1 });
});
