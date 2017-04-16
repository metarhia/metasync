'use strict';

const assert = require('assert');
const metasync = require('..');

console.log('Collector tests');

const dc = metasync
  .collect(3)
  .timeout(5000)
  .done((error, result) => {
    console.log('Collector test #1 done: ' + JSON.stringify(result));
    assert.strictEqual(Object.keys(result).length, 3);
  });

dc('key1', 1);
dc('key2', 2);
dc('key3', 3);

const kc = metasync
  .collect(['key1', 'key2', 'key3'])
  .timeout(5000)
  .done((error, result) => {
    console.log('Collector test #2 done: ' + JSON.stringify(result));
    assert.strictEqual(Object.keys(result).length, 3);
  });

kc('key1', 1);
kc('key2', 2);
kc('key3', 3);
