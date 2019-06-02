'use strict';

const common = require('@metarhia/common');
const nodeVerion = common.between(process.version, 'v', '.');

const submodules = [
  'composition', // Unified abstraction
  'adapters', // Adapters to convert different async contracts
  'array', // Array utilities
  'async-emitter', // AsyncEmitter
  'chain', // Process arrays sync and async array in chain
  'collector', // DataCollector and KeyCollector
  'control', // Control flow utilities
  'do', // Simple chain/do
  'fp', // Async utils for functional programming
  'memoize', // Async memoization
  'poolify', // Create pool from factory
  'queue', // Concurrent queue
  'throttle', // Throttling utilities
].map(path => require('./lib/' + path));

if (nodeVerion >= 10) {
  submodules.push(require('./lib/async-iterator'));
}

const { compose } = submodules[0];
module.exports = Object.assign(compose, ...submodules);
