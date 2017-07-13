'use strict';

const benchmark = require('./benchmark.js');
const metasync = require('../..');

function FlowSequential(done) {
  let i = 0;
  const p1 = (callback) => {
    setImmediate(() => callback(null, ++i * 2));
  };
  const p2 = (callback) => {
    setImmediate(() => callback(null, ++i * 3));
  };
  const p3 = (callback) => {
    setImmediate(() => callback(null, ++i * 5));
  };
  const p4 = (callback) => {
    setImmediate(() => callback(null, 'key ' + ++i));
  };
  const p5 = (callback) => {
    setImmediate(() => callback(null, ++i === 5));
  };
  const p6 = (callback) => {
    setImmediate(() => callback(null, 'key' + ++i * 2));
  };

  const f1 = metasync.flow([p1, p2, p3, p4, p5, p6]);
  f1({}, (err, result) => done(result));
}

benchmark.do(100000, [FlowSequential]);
