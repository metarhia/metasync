'use strict';

const flow = require('./lib/flow');
const arrayUtils = require('./lib/array.utils');
const arrayChain = require('./lib/array.chain');
const collectors = require('./lib/collectors');
const queue = require('./lib/queue');
const throttle = require('./lib/throttle');

const metasync = {};
module.exports = metasync;

Object.assign(
  metasync,
  flow, // Flow control
  arrayUtils, // Array utilities
  arrayChain, // Process arrays sync and async array in chain
  collectors, // DataCollector and KeyCollector
  queue, // Concurrency
  throttle // Throttling
);
