'use strict';

const composition = require('./lib/composition.js');
const adapters = require('./lib/adapters.js');
const array = require('./lib/array.js');
const collector = require('./lib/collector.js');
const control = require('./lib/control.js');
const doModule = require('./lib/do.js');
const fp = require('./lib/fp.js');
const memoize = require('./lib/memoize.js');
const poolify = require('./lib/poolify.js');
const queue = require('./lib/queue.js');
const throttle = require('./lib/throttle.js');
const asyncIterator = require('./lib/async-iterator.js');

const { compose } = composition;

const submodules = {
  ...composition, // Unified abstraction
  ...adapters, // Adapters to convert different async contracts
  ...array, // Array utilities
  ...collector, // DataCollector and KeyCollector
  ...control, // Control flow utilities
  ...doModule, // Simple chain/do
  ...fp, // Async utils for functional programming
  ...memoize, // Async memoization
  ...poolify, // Create pool from factory
  ...queue, // Concurrent queue
  ...throttle, // Throttling utilities
  ...asyncIterator, // AsyncIterator utilities
};

module.exports = Object.assign(compose, submodules);
