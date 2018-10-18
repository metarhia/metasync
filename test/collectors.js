'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('data collector', test => {
  const expectedResult = {
    key1: 1,
    key2: 2,
    key3: 3,
  };

  const dc = metasync
    .collect(3)
    .done((err, result) => {
      test.error(err);
      test.strictSame(result, expectedResult);
      test.end();
    })
    .timeout(1000);

  dc.collect('key1', null, 1);
  dc.collect('key2', null, 2);
  dc.collect('key3', null, 3);
});

metatests.test('data collector', test => {
  const expectedResult = {
    key1: 1,
    key2: 2,
    key3: 3,
  };

  const kc = metasync
    .collect(['key1', 'key2', 'key3'])
    .done((err, result) => {
      test.error(err);
      test.strictSame(result, expectedResult);
      test.end();
    })
    .timeout();

  kc.collect('key1', null, 1);
  kc.collect('key2', null, 2);
  kc.collect('key3', null, 3);
});

metatests.test('distinct data collector', test => {
  const expectedResult = {
    key1: 2,
    key2: 2,
    key3: 3,
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

metatests.test('distinct key collector', test => {
  const expectedResult = {
    key1: 2,
    key2: 2,
    key3: 3,
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

metatests.test('data collector with repeated keys', test => {
  const dc = metasync
    .collect(3)
    .timeout(100)
    .done(err => {
      test.assert(err);
      test.end();
    });

  dc.collect('key1', null, 1);
  dc.collect('key1', null, 2);
  dc.collect('key2', null, 2);
});

metatests.test('key collector with repeated keys', test => {
  const kc = metasync
    .collect(['key1', 'key2', 'key3'])
    .timeout(100)
    .done(err => {
      test.assert(err);
      test.end();
    });

  kc.collect('key1', null, 1);
  kc.collect('key1', null, 2);
  kc.collect('key2', null, 2);
});

metatests.test('collect with error', test => {
  const testErr = new Error('Test error');
  const col = metasync.collect(1);
  col.done((err, res) => {
    test.strictSame(err, testErr);
    test.strictSame(res, {});
    test.end();
  });
  col.fail('someKey', testErr);
});

metatests.test('collect method calling after it\'s done', test => {
  const col = metasync.collect(1);
  col.done((err, res) => {
    test.error(err);
    test.strictSame(res, { someKey: 'someVal' });
    test.end();
  });
  col.pick('someKey', 'someVal');
  col.pick('someKey2', 'someVal2');
});

metatests.test('keys collector receives wrong key', test => {
  const col = metasync.collect(['rightKey']);
  col.done((err, res) => {
    test.error(err);
    test.strictSame(res, { wrongKey: 'someVal', rightKey: 'someVal' });
    test.end();
  });
  col.pick('wrongKey', 'someVal');
  col.pick('rightKey', 'someVal');
});

metatests.test('distinct keys collector receives wrong key', test => {
  const col = metasync.collect(['rightKey']).distinct();
  col.done(err => {
    test.assert(err);
    test.end();
  });
  col.pick('wrongKey', 'someVal');
  col.pick('rightKey', 'someVal');
});

metatests.test('collect with take', test => {
  const col = metasync.collect(1);
  col.done((err, res) => {
    test.error(err);
    test.strictSame(res, { someKey: 'someVal' });
    test.end();
  });
  const af = (x, callback) => callback(null, x);
  col.take('someKey', af, 'someVal');
});

metatests.test('collect with timeout error', test => {
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

metatests.test('collect with take calls bigger than expected', test => {
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

metatests.test('cancel data collector', test => {
  const dc = metasync
    .collect(3)
    .done(err => {
      test.assert(err);
      test.end();
    });

  dc.pick('key', 'value');
  dc.cancel();
});

metatests.test('cancel key collector', test => {
  const dc = metasync
    .collect(['uno', 'due'])
    .done(err => {
      test.assert(err);
      test.end();
    });

  dc.pick('key', 'value');
  dc.cancel();
});

metatests.test('collect then success', test => {
  const col = metasync.collect(1).then(
    result => {
      test.assert(result);
      test.end();
    },
    err => {
      test.error(err);
      test.end();
    }
  );
  col.pick('Key', 'value');
});

metatests.test('collect then fail', test => {
  metasync.collect(5).timeout(10).then(
    result => {
      test.error(result);
      test.end();
    },
    err => {
      test.assert(err);
      test.end();
    }
  );
});
