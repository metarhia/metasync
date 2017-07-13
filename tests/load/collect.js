'use strict';

const benchmark = require('./benchmark.js');
const metasync = require('../..');

function Collect(done) {
  const dc = metasync.collect(6);
  dc.done((err, result) => done(result));
  let i = 0;
  setImmediate(() => dc.pick('uno', ++i * 2));
  setImmediate(() => dc.pick('due', ++i * 3));
  setImmediate(() => dc.pick('tre', ++i * 5));
  setImmediate(() => dc.pick('4th', 'key' + ++i));
  setImmediate(() => dc.pick('5th', ++i === 5));
  setImmediate(() => dc.pick('6th', 'key' + ++i * 2));
}

benchmark.do(1000000, [Collect]);
