'use strict';

const tests = [
  'chain',
  'composition',
  'composition.pause',
  'composition.sequential',
  'collector'
];

tests
  .map(file => './' + file + '.js')
  .forEach(require);
