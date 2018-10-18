'use strict';

const count = 100000;

const benchmark = require('./benchmark.js');

const PromiseThen = done => {
  let i = 0;
  const p1 = new Promise(resolve => {
    setImmediate(() => resolve({ p1: ++i * 2 }));
  });
  const p2 = new Promise(resolve => {
    setImmediate(() => resolve({ p2: ++i * 3 }));
  });
  const p3 = new Promise(resolve => {
    setImmediate(() => resolve({ p3: ++i * 5 }));
  });
  const p4 = new Promise(resolve => {
    setImmediate(() => resolve({ p4: 'key ' + ++i }));
  });
  const p5 = new Promise(resolve => {
    setImmediate(() => resolve({ p5: ++i === 5 }));
  });
  const p6 = new Promise(resolve => {
    setImmediate(() => resolve({ p6: 'key' + ++i * 2 }));
  });
  Promise.resolve()
    .then(p1)
    .then(p2)
    .then(p3)
    .then(p4)
    .then(p5)
    .then(p6)
    .then(res => done(null, res))
    .catch(console.error);
};

benchmark.do(count, [PromiseThen]);
