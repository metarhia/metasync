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

tap.test('promisify', (test) => {

  const id = 100;
  const data = { key: 'value' };

  const getDataAsync = (dataId, callback) => {
    test.strictSame(dataId, id);
    callback(null, data);
  };

  const getDataPromise = metasync.promisify(getDataAsync);
  getDataPromise(id).then(result => {
    test.strictSame(result, data);
    test.end();
  }).catch(err => {
    throw err;
  });

});
