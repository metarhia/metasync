'use strict';

const submodules = [
  'flow', // Flow control
  'array', // Array utilities
  'chain', // Process arrays sync and async array in chain
  'collector', // DataCollector and KeyCollector
  'queue', // Concurrency
  'throttle', // Throttling
  'fp', // Async utils for functional programming
].map(path => './lib/' + path).map(require);

module.exports = Object.assign({}, ...submodules);
