'use strict';

const tests = [
  'chain',
  'composition',
  'composition.pause',
  'composition.sequential',
  'composition.cancel',
  'collector'
];

tests
  .map(file => './' + file + '.js')
  .forEach(require);
