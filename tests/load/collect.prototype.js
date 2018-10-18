'use strict';

const COUNT = 1000000;

const benchmark = require('./benchmark.js');
const metasync = require('../../lib/collector.prototype.js');

const CollectOldPrototype = done => {
  const dc = new metasync.DataCollector(6);
  dc.on('done', done);
  let i = 0;
  setImmediate(() => dc.collect('uno', ++i * 2));
  setImmediate(() => dc.collect('due', ++i * 3));
  setImmediate(() => dc.collect('tre', ++i * 5));
  setImmediate(() => dc.collect('4th', 'key' + ++i));
  setImmediate(() => dc.collect('5th', ++i === 5));
  setImmediate(() => dc.collect('6th', 'key' + ++i * 2));
};

benchmark.do(COUNT, [CollectOldPrototype]);
