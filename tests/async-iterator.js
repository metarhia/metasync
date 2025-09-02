'use strict';

const path = require('path');

const { between } = require('metautil');

const nodeVerion = between(process.version, 'v', '.');
const testFilePath = path.join(__dirname, './fixtures/iterator.js');

if (nodeVerion >= 10) require(testFilePath);
