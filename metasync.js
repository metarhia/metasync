'use strict';

const submodules = [
  'composition', // Unified abstraction
  'control', // Control flow utilities
  'fp', // Async utils for functional programming
  'adapters', // Adapters to convert different async contracts
  'throttle', // Throttling utilities
  'array', // Array utilities
  'chain', // Process arrays sync and async array in chain
  'collector', // DataCollector and KeyCollector
  'queue', // Concurrent queue
  'memoize', // Async memoization
  'do', // Simple chain/do
  'poolify', // Create pool from factory
].map(path => require('./lib/' + path));

const { compose } = submodules[0];
module.exports = Object.assign(compose, ...submodules);
