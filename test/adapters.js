'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('callbackify: Promise to callback-last', test => {
  const promiseReturning = () => Promise.resolve('result');
  const asyncFn = metasync.callbackify(promiseReturning);

  asyncFn((err, value) => {
    if (err) {
      test.error(err, 'must not throw');
    }
    test.strictSame(value, 'result');
    test.end();
  });
});

metatests.test('asyncify: sync function to callback-last', test => {
  const fn = par => par;
  const asyncFn = metasync.asyncify(fn);

  asyncFn('result', (err, value) => {
    if (err) {
      test.error(err, 'must not throw');
    }
    test.strictSame(value, 'result');
    test.end();
  });
});

metatests.test('promisify: callback-last to Promise', test => {
  const id = 100;
  const data = { key: 'value' };

  const getDataAsync = (dataId, callback) => {
    test.strictSame(dataId, id);
    callback(null, data);
  };

  const getDataPromise = metasync.promisify(getDataAsync);
  getDataPromise(id)
    .then(result => {
      test.strictSame(result, data);
      test.end();
    })
    .catch(err => {
      test.error(err, 'must not throw');
    });
});

metatests.test('promisify: callback-last to Promise throw', test => {
  const id = 100;

  const getDataAsync = (dataId, callback) => {
    test.strictSame(dataId, id);
    callback(new Error('Data not found'));
  };

  const getDataPromise = metasync.promisify(getDataAsync);
  getDataPromise(id)
    .then(result => {
      test.notOk(result);
    })
    .catch(err => {
      test.ok(err);
      test.end();
    });
});

metatests.test('promisify: sync function to Promise', test => {
  const id = 100;
  const data = { key: 'value' };

  const getDataSync = dataId => {
    test.strictSame(dataId, id);
    return data;
  };

  const getDataPromise = metasync.promisifySync(getDataSync);
  getDataPromise(id)
    .then(result => {
      test.strictSame(result, data);
      test.end();
    })
    .catch(err => {
      test.error(err, 'must not throw');
    });
});

metatests.test('promisify: sync to Promise throw', test => {
  const id = 100;

  const getDataSync = dataId => {
    test.strictSame(dataId, id);
    throw new Error('Data not found');
  };

  const getDataPromise = metasync.promisifySync(getDataSync);
  getDataPromise(id)
    .then(result => {
      test.notOk(result);
    })
    .catch(err => {
      test.ok(err);
      test.end();
    });
});

metatests.test('promiseToCallbackLast: Promise to callback-last', test => {
  const promise = Promise.resolve('result');
  const asyncFn = metasync.promiseToCallbackLast(promise);

  asyncFn((err, value) => {
    if (err) {
      test.error(err, 'must not throw');
    }
    test.strictSame(value, 'result');
    test.end();
  });
});
