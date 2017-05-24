'use strict';

const api = {};
api.metasync = {};
api.common = require('metarhia-common');
api.util = require('util');

module.exports = api.metasync;

const submodules = [
  'utils', // Basic utilities
  'flow', // Flow control
  'array', // Array utilities
  'chain', // Process arrays sync and async array in chain
  'collectors', // DataCollector and KeyCollector
  'queue', // Concurrency
  'throttle', // Throttling
  'monad', // Async functions as monad
];

submodules
  .map(path => './lib/' + path)
  .map(require)
  .map(exports => exports(api));
