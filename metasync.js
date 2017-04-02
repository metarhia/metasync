'use strict';

const api = {};
api.metasync = {};
api.common = require('metarhia-common');

module.exports = api.metasync;

const submodules = [
  'utils', // Basic utilities
  'flow', // Flow control
  'array', // Array utilities
  'chain', // Process arrays sync and async array in chain
  'collectors', // DataCollector and KeyCollector
  'queue', // Concurrency
  'throttle' // Throttling
];

submodules
  .map(path => './lib/' + path)
  .map(require)
  .map(exports => exports(api));
