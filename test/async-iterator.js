'use strict';

const path = require('path');

const common = require('@metarhia/common');

const nodeVerion = common.between(process.version, 'v', '.');
const testFilePath = path.join(__dirname, './fixtures/iterator.js');

if (nodeVerion >= 10) require(testFilePath);
