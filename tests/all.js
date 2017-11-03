'use strict';

['chain', 'flow', 'collector']
  .map(file => './' + file + '.js')
  .forEach(require);
