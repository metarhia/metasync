'use strict';

['chain', 'flow', 'flow.sequential', 'collector']
  .map(file => './' + file + '.js')
  .forEach(require);
