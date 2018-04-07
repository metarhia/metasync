'use strict';

['chain', 'composition', 'composition.sequential', 'collector']
  .map(file => './' + file + '.js')
  .forEach(require);
