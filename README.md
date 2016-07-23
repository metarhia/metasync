Meta Async Programming Approach

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

## Contributors

  - Timur Shemsedinov (marcusaurelius)
