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

dc.pick('key1', 1);
dc.pick('key2', 2);
dc.pick('key3', 3);

const kc = metasync
  .collect(['key1', 'key2', 'key3'])
  .timeout(5000)
  .done((error, result) => {
    console.log('Collector test #2 done: ' + JSON.stringify(result));
    assert.strictEqual(Object.keys(result).length, 3);
  });

kc.pick('key1', 1);
kc.pick('key2', 2);
kc.pick('key3', 3);

{
  const dc = metasync
    .collect(3)
    .timeout(5000)
    .distinct()
    .done((error, result) => {
      console.log('Collector test #3 done: ' + JSON.stringify(result));
      assert.strictEqual(Object.keys(result).length, 3);
    });

  dc('key1', null, 1);
  dc('key1', null, 2);
  dc('key2', null, 2);
  dc('key3', null, 3);
}

{
  const kc = metasync
    .collect(['key1', 'key2', 'key3'])
    .timeout(5000)
    .distinct()
    .done((error, result) => {
      console.log('Collector test #4 done: ' + JSON.stringify(result));
      assert.strictEqual(Object.keys(result).length, 3);
    });

  kc('key1', null, 1);
  kc('key1', null, 2);
  kc('key2', null, 2);
  kc('key3', null, 3);
}

{
  const dc = metasync
    .collect(3)
    .timeout(5000)
    .done((error, result) => {
      console.log('Collector test #5 done: ' + JSON.stringify(result));
      assert.strictEqual(Object.keys(result).length, 2);
    });

  dc('key1', null, 1);
  dc('key1', null, 2);
  dc('key2', null, 2);
}

{
  const kc = metasync
    .collect(['key1', 'key2', 'key3'])
    .timeout(5000)
    .done((error, result) => {
      console.log('Collector test #6 done: ' + JSON.stringify(result));
      assert.strictEqual(Object.keys(result).length, 2);
    });

  kc('key1', null, 1);
  kc('key1', null, 2);
  kc('key2', null, 2);
}
{
  const dc = metasync
    .collect(3)
    .timeout(5000)
    .done((error, result) => {
      console.log('Collector test #3 done: ' + JSON.stringify(result));
      assert.strictEqual(Object.keys(result).length, 3);
      assert.strictEqual(result.key3, 3);
    });

  const asyncReturn = (x, cb) => setTimeout(cb, 0, null, x);

  dc.pick('key1', 1);
  dc('key2', null, 2);
  dc.take('key3', asyncReturn, 3);
}
