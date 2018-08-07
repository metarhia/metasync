'use strict';

const fs = require('fs');

const main = fs.readFileSync('./metasync.js').toString();
fs.writeFileSync('./metasync.browser.js', main.replace('./lib/', './dist/'));
