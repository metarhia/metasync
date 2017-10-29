'use strict';

const tap = require('tap');
const metasync = require('..');

tap.test('callbackify: Promise to callback-last', (test) => {

  const promise = Promise.resolve('result');
  const callback = metasync.callbackify(promise);

  callback((err, value) => {
    if (err) throw err;
    test.strictSame(value, 'result');
    test.end();
  });

});

tap.test('callbackify: sync function to callback-last', (test) => {

  const source = par => par;
  const callback = metasync.callbackify(source);

  callback('result', (err, value) => {
    if (err) throw err;
    test.strictSame(value, 'result');
    test.end();
  });

});

tap.test('promisify: callback-last to Promise', (test) => {

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

tap.test('promisify: sync function to Promise', (test) => {

  const id = 100;
  const data = { key: 'value' };

  const getDataSync = (dataId) => {
    test.strictSame(dataId, id);
    return data;
  };

  const getDataPromise = metasync.promisifySync(getDataSync);
  getDataPromise(id).then(result => {
    test.strictSame(result, data);
    test.end();
  }).catch(err => {
    throw err;
  });

});
