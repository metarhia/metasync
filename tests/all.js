'use strict';

['chain', 'flow', 'examples']
  .map(file => './' + file + '.js')
  .forEach(require);
