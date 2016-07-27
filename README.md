# Meta Async Programming Approach

[![Build Status](https://travis-ci.org/metarhia/MetaSync.svg?branch=master)](https://travis-ci.org/metarhia/MetaSync)
[![Dependency Status](https://david-dm.org/metarhia/MetaSync.svg)](https://david-dm.org/metarhia/MetaSync)

## Installation

```bash
$ npm install metasync
```

## Examples

An Event-driven Asyncronous Data Collector
```JavaScript
var metasync = require('metasync');
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
```

Functional Asyncronous Composition
```JavaScript
metasync.composition(
  [f1,f2,f3,[[f4,f5,[f6,f7],f8]],f9],
  function done(data) {
    console.log('done');
  }
);
```

Asynchrous filter
```JavaScript
metasync.filter(['data', 'to', 'filter'], function(item, callback) {
  callback(item.length > 2);
}, function(result) {
  console.dir(result);
});
```

Asynchrous find
```JavaScript
metasync.find(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  function(item, callback) {
    callback(item % 3 === 0 && item % 5 === 0);
  },
  function(result) {
    console.dir(result);
  }
);
```

## Contributors

  - Timur Shemsedinov (marcusaurelius)
  - See github for full [contributors list](https://github.com/metarhia/MetaSync/graphs/contributors)
