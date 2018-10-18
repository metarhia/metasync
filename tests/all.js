'use strict';

const tests = [
  'composition',
  'composition.pause',
  'composition.parallel',
  'composition.sequential',
  'composition.cancel',
  'collector',
];

tests
  .map(file => './' + file + '.js')
  .forEach(require);
