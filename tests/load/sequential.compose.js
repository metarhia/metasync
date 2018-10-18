'use strict';

const count = 100000;

const benchmark = require('./benchmark.js');
const metasync = require('../..');

const composeSequential = done => {
  let i = 0;
  const p1 = (context, callback) => {
    setImmediate(() => callback(null, ++i * 2));
  };
  const p2 = (context, callback) => {
    setImmediate(() => callback(null, ++i * 3));
  };
  const p3 = (context, callback) => {
    setImmediate(() => callback(null, ++i * 5));
  };
  const p4 = (context, callback) => {
    setImmediate(() => callback(null, 'key ' + ++i));
  };
  const p5 = (context, callback) => {
    setImmediate(() => callback(null, ++i === 5));
  };
  const p6 = (context, callback) => {
    setImmediate(() => callback(null, 'key' + ++i * 2));
  };

  const f1 = metasync([p1, p2, p3, p4, p5, p6]);
  f1(done);
};

benchmark.do(count, [composeSequential]);
