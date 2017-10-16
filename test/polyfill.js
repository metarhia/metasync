'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('callbackify', (test) => {

  const promise = Promise.resolve('result');
  const callback = metasync.callbackify(promise);

  callback((err, value) => {
    if (err) throw err;
    test.strictSame(value, 'result');
    test.end();
  });

});
