'use strict';

const assert = require('assert');
const metasync = require('..');

const dc = metasync
  .collect(3)
  .timeout(5000)
  .done((error, result) => {
    assert.ifError(error);
    assert.strictEqual(Object.keys(result).length, 3);
  });

dc.pick('key1', 1);
dc.pick('key2', 2);
dc.pick('key3', 3);

const kc = metasync
  .collect(['key1', 'key2', 'key3'])
  .timeout(5000)
  .done((error, result) => {
    assert.ifError(error);
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
      assert.ifError(error);
      assert.strictEqual(Object.keys(result).length, 3);
    });

  dc.collect('key1', null, 1);
  dc.collect('key1', null, 2);
  dc.collect('key2', null, 2);
  dc.collect('key3', null, 3);
}

{
  const kc = metasync
    .collect(['key1', 'key2', 'key3'])
    .timeout(5000)
    .distinct()
    .done((error, result) => {
      assert.ifError(error);
      assert.strictEqual(Object.keys(result).length, 3);
    });

  kc.collect('key1', null, 1);
  kc.collect('key1', null, 2);
  kc.collect('key2', null, 2);
  kc.collect('key3', null, 3);
}

{
  const dc = metasync
    .collect(3)
    .timeout(5000)
    .done((error, result) => {
      assert.ok(error);
      assert.strictEqual(Object.keys(result).length, 2);
    });

  dc.collect('key1', null, 1);
  dc.collect('key1', null, 2);
  dc.collect('key2', null, 2);
}

{
  const kc = metasync
    .collect(['key1', 'key2', 'key3'])
    .timeout(5000)
    .done((error, result) => {
      assert.ok(error);
      assert.strictEqual(Object.keys(result).length, 2);
    });

  kc.collect('key1', null, 1);
  kc.collect('key1', null, 2);
  kc.collect('key2', null, 2);
}

{
  const dc = metasync
    .collect(3)
    .timeout(5000)
    .done((error, result) => {
      assert.ifError(error);
      assert.strictEqual(Object.keys(result).length, 3);
      assert.strictEqual(result.key3, 3);
    });

  const asyncReturn = (x, cb) => {
    setTimeout(() => {
      cb(null, x);
    });
  };

  dc.pick('key1', 1);
  dc.collect('key2', null, 2);
  dc.take('key3', asyncReturn, 3);
  dc.take('key4', asyncReturn, 5);
}
