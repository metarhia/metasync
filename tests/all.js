'use strict';

['chain', 'flow', 'collector', 'flow.case']
  .map(file => './' + file + '.js')
  .forEach(require);
