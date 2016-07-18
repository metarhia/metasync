'use strict';

var metasync = require('./metasync');
var fs = require('fs');

var dataCollector = new metasync.DataCollector(4, function(data) {
  console.dir(Object.keys(data));
});

dataCollector.collect('user', { name: 'Marcus Aurelius' });

fs.readFile('HISTORY.md', function(err, data) {
  dataCollector.collect('history', data);
});

fs.readFile('README.md', function(err, data) {
  dataCollector.collect('readme', data);
});

setTimeout(function() {
  dataCollector.collect('timer', { date: new Date() });
}, 1000);
