'use strict';

const assert = require('assert');
const metasync = require('..');

console.log('Queue tests');

const cq = metasync.queue(3)
  .wait(2000)
  .timeout(5000)
  .throttle(100, 1000)
  .process((n, cb) => cb(null, ++n))
  .output((err, data) => {
    console.dir({ err, data });
    assert.strictEqual(typeof(data), 'number');
    assert(data > 1);
    assert(data < 10);
  })
  .drain(() => {
    console.log('Queue tests #1 done');
  });

cq(1);
cq(2);
cq(3);
cq(4);
cq(5);
cq(6);
cq(7);
cq(8);
