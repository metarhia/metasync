'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('memoize', test => {
  const storage = {
    file1: Buffer.from('file1'),
    file2: Buffer.from('file2'),
  };

  const getData = (file, callback) => {
    process.nextTick(() => {
      const result = storage[file];
      if (result) callback(null, result);
      else callback(new Error('File not found'));
    });
  };

  const memoizedGetData = metasync.memoize(getData);

  const keys = [];
  memoizedGetData.on('memoize', key => {
    keys.push(key);
  });

  memoizedGetData('file1', (err, data) => {
    test.error(err);
    test.strictSame(data, storage.file1);
    memoizedGetData('file2', (err, data) => {
      test.error(err);
      test.strictSame(data, storage.file2);
      memoizedGetData('file1', (err, data) => {
        test.error(err);
        test.strictSame(data, storage.file1);
        memoizedGetData('file2', (err, data) => {
          test.error(err);
          test.strictSame(data, storage.file2);
          test.strictSame(keys, ['file1', 'file2']);
          test.end();
        });
      });
    });
  });
});

metatests.test('memoize clear cache', test => {
  const storage = {
    file1: Buffer.from('file1'),
  };

  const getData = (file, callback) => {
    process.nextTick(() => {
      const result = storage[file];
      if (result) callback(null, result);
      else callback(new Error('File not found'));
    });
  };

  const memoizedGetData = metasync.memoize(getData);

  let onClear = false;
  memoizedGetData.on('clear', () => {
    onClear = true;
  });

  memoizedGetData('file1', (err, data) => {
    test.error(err);
    test.strictSame(data, storage.file1);
    storage.file1 = Buffer.from('changed');
    memoizedGetData.clear();
    memoizedGetData('file1', (err, data) => {
      test.error(err);
      test.strictSame(data, Buffer.from('changed'));
      test.strictSame(onClear, true);
      test.end();
    });
  });
});

metatests.test('memoize cache del', test => {
  const storage = {
    file1: Buffer.from('file1'),
  };

  const getData = (file, callback) => {
    process.nextTick(() => {
      const result = storage[file];
      if (result) callback(null, result);
      else callback(new Error('File not found'));
    });
  };

  const memoizedGetData = metasync.memoize(getData);

  let onDel = false;
  memoizedGetData.on('del', () => {
    onDel = true;
  });

  memoizedGetData('file1', (err, data) => {
    test.error(err);
    test.strictSame(data, storage.file1);
    storage.file1 = Buffer.from('changed');
    memoizedGetData.del('file1');
    memoizedGetData('file1', (err, data) => {
      test.error(err);
      test.strictSame(data, Buffer.from('changed'));
      test.strictSame(onDel, true);
      test.end();
    });
  });
});

metatests.test('memoize cache add', test => {
  const getData = (file, callback) => {
    process.nextTick(() => {
      const result = Buffer.from('added');
      callback(null, result);
    });
  };

  const memoizedGetData = metasync.memoize(getData);

  let onAdd = false;
  memoizedGetData.on('add', () => {
    onAdd = true;
  });

  const file1 = Buffer.from('added');
  memoizedGetData.add('file1', null, file1);
  memoizedGetData('file1', (err, data) => {
    test.error(err);
    test.strictSame(data, Buffer.from('added'));
    test.strictSame(onAdd, true);
    test.end();
  });
});

metatests.test('memoize cache get', test => {
  const getData = (file, callback) => {
    process.nextTick(() => {
      const result = Buffer.from('added');
      callback(null, result);
    });
  };

  const memoizedGetData = metasync.memoize(getData);

  const file1 = Buffer.from('added');
  memoizedGetData.add('file1', null, file1);
  memoizedGetData.get('file1', (err, data) => {
    test.error(err);
    test.strictSame(data, Buffer.from('added'));
    test.end();
  });
});
