# Asynchronous Programming Library

[![TravisCI](https://travis-ci.org/metarhia/metasync.svg?branch=master)](https://travis-ci.org/metarhia/metasync)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/60fe108b31614b4191cd557d49112169)](https://www.codacy.com/app/metarhia/metasync)
[![NPM Version](https://badge.fury.io/js/metasync.svg)](https://badge.fury.io/js/metasync)
[![NPM Downloads/Month](https://img.shields.io/npm/dm/metasync.svg)](https://www.npmjs.com/package/metasync)
[![NPM Downloads](https://img.shields.io/npm/dt/metasync.svg)](https://www.npmjs.com/package/metasync)

## Installation

```bash
$ npm install metasync
```

## Asynchronous functions composition

`metasync(fns)(data, done)`

- `fns` - array of callback-last functions, callback contranct err-first
- `data` - input data (optional)
- `done` - err-first callback
- Returns: composed callback-last / err-first function

![composition](https://cloud.githubusercontent.com/assets/4405297/16968374/1b81f160-4e17-11e6-96fa-9d7e2b422396.png)

```js
const composed = metasync([f1, f2, f3, [[f4, f5, [f6, f7], f8]], f9]);
```

- Array of functions gives sequential execution: `[f1, f2, f3]`
- Double brackets array of functions gives parallel execution: `[[f1, f2, f3]]`

_Example:_

```js
const metasync = require('metasync');
const fs = require('fs');

// Data collector (collect keys by count)
const dc = metasync.collect(4);

dc.pick('user', { name: 'Marcus Aurelius' });
fs.readFile('HISTORY.md', (err, data) => dc.collect('history', err, data));
dc.take('readme', fs.readFile, 'README.md');
setTimeout(() => dc.pick('timer', { date: new Date() }), 1000);

// Key collector (collect certain keys by names)
const kc = metasync
  .collect(['user', 'history', 'readme', 'timer'])
  .timeout(2000)
  .distinct()
  .done((err, data) => console.log(data));

kc.pick('user', { name: 'Marcus Aurelius' });
kc.take('history', fs.readFile, 'HISTORY.md');
kc.take('readme', fs.readFile, 'README.md');
setTimeout(() => kc.pick('timer', { date: new Date() }), 1000);
```

## API
