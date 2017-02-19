# Meta Async Programming Approach

[![TravisCI](https://travis-ci.org/metarhia/MetaSync.svg?branch=master)](https://travis-ci.org/metarhia/MetaSync)
[![bitHound](https://www.bithound.io/github/metarhia/MetaSync/badges/score.svg)](https://www.bithound.io/github/metarhia/MetaSync)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/60fe108b31614b4191cd557d49112169)](https://www.codacy.com/app/metarhia/MetaSync)
[![NPM Version](https://badge.fury.io/js/metasync.svg)](https://badge.fury.io/js/metasync)
[![NPM Downloads/Month](https://img.shields.io/npm/dm/metasync.svg)](https://www.npmjs.com/package/metasync)
[![NPM Downloads](https://img.shields.io/npm/dt/metasync.svg)](https://www.npmjs.com/package/metasync)

## Installation

```bash
$ npm install metasync
```

# Examples

## Functional Asyncronous Composition

Syntax: `metasync.composition(functions, [done, [data]]);`

Parameters:
- functions - array of `function([data,] callback)` where:
  - data - optional incoming data
  - callback - `function([data])` where:
    - data - outgoing data
- done - `callback(data)` where:
  - data - hash with of functions results
- data - incoming data

```JavaScript
metasync.composition(
  [f1, f2, f3, [[f4, f5, [f6, f7], f8]], f9]
);
```

- Array of functions gives sequential execution: `[f1, f2, f3]`
- Double brackets array of functions gives parallel execution: `[[f1, f2, f3]]`

Examples of functions:

```JavaScript
// with one argiment and no result
function f1(callback) {
  callback();
}

// with one argiment and returning result
function f2(callback) {
  callback('value');
}

// with two argiments and result
function f3(data, callback) {
  // assign result to data random key
  data.keyName = 'value';
  // returning no result
  callback();
}
```

## An Event-driven Asyncronous Data Collector

```JavaScript
var metasync = require('metasync');
var fs = require('fs');

var dataCollector = new metasync.DataCollector(4, (data) => {
  console.dir(Object.keys(data));
});

dataCollector.collect('user', { name: 'Marcus Aurelius' });

fs.readFile('HISTORY.md', (err, data) => {
  dataCollector.collect('history', data);
});

fs.readFile('README.md', (err, data) => {
  dataCollector.collect('readme', data);
});

setTimeout(() => {
  dataCollector.collect('timer', { date: new Date() });
}, 1000);
```

## Parallel execution

```JavaScript
metasync.parallel([f1, f2, f3], () =>  { ... });
```

## Sequential execution

```JavaScript
metasync.sequential([f1, f2, f3], () => { ... });
```

## Asynchrous filter

```JavaScript
metasync.filter(['data', 'to', 'filter'], (item, callback) => {
  callback(item.length > 2);
}, (result) => {
  console.dir(result);
});
```

## Asynchrous find

```JavaScript
metasync.find(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  (item, callback) => (
    callback(item % 3 === 0 && item % 5 === 0)
  ),
  (result) => {
    console.dir(result);
  }
);
```

## Asyncronous series (sequential)

```JavaScript
metasync.series(
  ['a', 'b', 'c'],
  (item, callback) => {
    console.dir({ series: item });
    callback();
  },
  (data) => {
    console.dir('series done');
  }
);
```

## Asyncronous each (parallel)

```JavaScript
metasync.each(
  ['a', 'b', 'c'],
  (item, callback) => {
    console.dir({ each: item });
    callback();
  },
  (data) => {
    console.dir('each done');
  }
);
```

## Contributors

  - Timur Shemsedinov (marcusaurelius)
  - See github for full [contributors list](https://github.com/metarhia/MetaSync/graphs/contributors)
