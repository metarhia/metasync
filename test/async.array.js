'use strict';

const common = require('metarhia-common');
const nodeVerion = common.between(process.version, 'v', '.');

if (nodeVerion >= 7) require('./fixtures/async-for.js');
