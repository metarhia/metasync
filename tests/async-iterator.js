'use strict';

const path = require('path');

const { between } = require('metautil');

const nodeVerion = between(process.version, 'v', '.');
const testFilePath = path.join(__dirname, './fixtures/iterator.js');

const supportsAsyncIter = nodeVerion >= 10;
if (supportsAsyncIter) require(testFilePath);
