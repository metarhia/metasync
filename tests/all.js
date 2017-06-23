'use strict';

['chain', 'flow', 'collector', 'examples']
  .map(file => './' + file + '.js')
  .forEach(require);
