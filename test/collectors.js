'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('data collector', (test) => {
  const expectedResult = {
    key1: 1,
    key2: 2,
    key3: 3
  };

  const dc = metasync
    .collect(3)
    .done((err, result) => {
      test.error(err);
      test.strictSame(result, expectedResult);
      test.end();
    })
    .timeout(1000);

  dc('key1', null, 1);
  dc('key2', null, 2);
  dc('key3', null, 3);
});

tap.test('data collector', (test) => {
  const expectedResult = {
    key1: 1,
    key2: 2,
    key3: 3
  };

  const kc = metasync
    .collect(['key1', 'key2', 'key3'])
    .done((err, result) => {
      test.error(err);
      test.strictSame(result, expectedResult);
      test.end();
    })
    .timeout();

  kc('key1', null, 1);
  kc('key2', null, 2);
  kc('key3', null, 3);
});

tap.test('distinct data collector', (test) => {
  const expectedResult = {
    key1: 2,
    key2: 2,
    key3: 3
  };

  const dc = metasync
    .collect(3)
    .distinct()
    .done((err, result) => {
      test.error(err);
      test.strictSame(result, expectedResult);
      test.end();
    });

  dc.pick('key1', 1);
  dc.pick('key1', 2);
  dc.pick('key2', 2);
  dc.pick('key3', 3);
});

tap.test('distinct key collector', (test) => {
  const expectedResult = {
    key1: 2,
    key2: 2,
    key3: 3
  };

  const kc = metasync
    .collect(['key1', 'key2', 'key3'])
    .distinct()
    .done((err, result) => {
      test.error(err);
      test.strictSame(result, expectedResult);
      test.end();
    });

  kc.pick('key1', 1);
  kc.pick('key1', 2);
  kc.pick('key2', 2);
  kc.pick('key3', 3);
});

tap.test('data collector with repeated keys', (test) => {
  const expectedResult = {
    key1: 2,
    key2: 2
  };

  const dc = metasync
    .collect(3)
    .done((err, result) => {
      test.error(err);
      test.strictSame(result, expectedResult);
      test.end();
    });

  dc('key1', null, 1);
  dc('key1', null, 2);
  dc('key2', null, 2);
});

tap.test('key collector with repeated keys', (test) => {
  const expectedResult = {
    key1: 2,
    key2: 2
  };

  const kc = metasync
    .collect(['key1', 'key2', 'key3'])
    .done((err, result) => {
      test.error(err);
      test.strictSame(result, expectedResult);
      test.end();
    });

  kc('key1', null, 1);
  kc('key1', null, 2);
  kc('key2', null, 2);
});

tap.test('collect with string argument', (test) => {
  const typeError = new TypeError('Unexpected type');
  try {
    metasync.collect('123');
  } catch (e) {
    test.strictSame(e, typeError);
    test.end();
  }
});

tap.test('collect with error', (test) => {
  const testErr = new Error('Test error');
  const col = metasync.collect(1);
  col.done((err, res) => {
    test.strictSame(err, testErr);
    test.strictSame(res, {});
    test.end();
  });
  col.fail('someKey', testErr);
});

tap.test('collect method calling after it\'s done', (test) => {
  const col = metasync.collect(1);
  col.done((err, res) => {
    test.error(err);
    test.strictSame(res, { someKey: 'someVal' });
    test.end();
  });
  col.pick('someKey', 'someVal');
  col.pick('someKey2', 'someVal2');
});

tap.test('keys collector receives wrong key', (test) => {
  const col = metasync.collect(['rightKey']);
  col.done((err, res) => {
    test.error(err);
    test.strictSame(res, { rightKey: 'someVal' });
    test.end();
  });
  col.pick('wrongKey', 'someVal');
  col.pick('rightKey', 'someVal');
});

tap.test('collect with take', (test) => {
  const col = metasync.collect(1);
  col.done((err, res) => {
    test.error(err);
    test.strictSame(res, { someKey: 'someVal' });
    test.end();
  });
  const af = (x, callback) => callback(null, x);
  col.take('someKey', af, 'someVal');
});

tap.test('collect with timeout error', (test) => {
  const timeoutErr = new Error('Collector timeout');
  const col = metasync.collect(1)
    .done((err, res) => {
      test.strictSame(err, timeoutErr);
      test.strictSame(res, {});
      test.end();
    })
    .timeout(1);
  const af = (x, callback) => setTimeout(() => callback(null, x), 2);
  col.take('someKey', af, 'someVal');
});

tap.test('collect with take calls bigger than expected', (test) => {
  const col = metasync.collect(1)
    .done((err, res) => {
      test.error(err);
      test.strictSame(Object.keys(res).length, 1);
      test.end();
    });
  const af = (x, callback) => setTimeout(() => callback(null, x), 1);
  col.take('someKey', af, 'someVal');
  col.take('someKey2', af, 'someVal2');
});
