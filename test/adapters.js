'use strict';

api.metatests.test('callbackify: Promise to callback-last', (test) => {

  const promise = Promise.resolve('result');
  const callback = api.metasync.callbackify(promise);

  callback((err, value) => {
    if (err) throw err;
    test.strictSame(value, 'result');
    test.end();
  });

});

api.metatests.test('callbackify: sync function to callback-last', (test) => {

  const source = par => par;
  const callback = api.metasync.callbackify(source);

  callback('result', (err, value) => {
    if (err) throw err;
    test.strictSame(value, 'result');
    test.end();
  });

});

api.metatests.test('promisify: callback-last to Promise', (test) => {

  const id = 100;
  const data = { key: 'value' };

  const getDataAsync = (dataId, callback) => {
    test.strictSame(dataId, id);
    callback(null, data);
  };

  const getDataPromise = api.metasync.promisify(getDataAsync);
  getDataPromise(id).then(result => {
    test.strictSame(result, data);
    test.end();
  }).catch(err => {
    throw err;
  });

});

api.metatests.test('promisify: callback-last to Promise throw', (test) => {

  const id = 100;

  const getDataAsync = (dataId, callback) => {
    test.strictSame(dataId, id);
    callback(new Error('Data not found'));
  };

  const getDataPromise = api.metasync.promisify(getDataAsync);
  getDataPromise(id).then(result => {
    test.notOk(result);
  }).catch(err => {
    test.ok(err);
    test.end();
  });

});


api.metatests.test('promisify: sync function to Promise', (test) => {

  const id = 100;
  const data = { key: 'value' };

  const getDataSync = (dataId) => {
    test.strictSame(dataId, id);
    return data;
  };

  const getDataPromise = api.metasync.promisifySync(getDataSync);
  getDataPromise(id).then(result => {
    test.strictSame(result, data);
    test.end();
  }).catch(err => {
    throw err;
  });

});

api.metatests.test('promisify: sync to Promise throw', (test) => {

  const id = 100;

  const getDataSync = (dataId) => {
    test.strictSame(dataId, id);
    return new Error('Data not found');
  };

  const getDataPromise = api.metasync.promisifySync(getDataSync);
  getDataPromise(id).then(result => {
    test.notOk(result);
  }).catch(err => {
    test.ok(err);
    test.end();
  });

});
