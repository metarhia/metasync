'use strict';

const tap = require('tap');
const metasync = require('..');

const wrapAsync = (
  // Emulate Asynchronous calls
  callback // function
) => {
  setTimeout(callback, Math.floor((Math.random() * 1000)));
};

tap.test('simple chain/do', (test) => {
  const readConfig = (name, callback) => {
    test.strictSame(name, 'myConfig');
    wrapAsync(() => {
      callback(null, { name });
    });
  };

  const selectFromDb = (query, callback) => {
    test.strictSame(query, 'select * from cities');
    wrapAsync(() => {
      callback(null, [{ name: 'Kiev' }, { name: 'Roma' }]);
    });
  };

  const getHttpPage = (url, callback) => {
    test.strictSame(url, 'http://kpi.ua');
    wrapAsync(() => {
      callback(null, '<html>Some archaic web here</html>');
    });
  };

  const readFile = (path, callback) => {
    test.strictSame(path, 'README.md');
    wrapAsync(() => {
      callback(null, 'file content');
    });
  };

  const c1 = metasync
    .do(readConfig, 'myConfig')
    .do(selectFromDb, 'select * from cities')
    .do(getHttpPage, 'http://kpi.ua')
    .do(readFile, 'README.md');

  c1((err, result) => {
    test.strictSame(err, null);
    test.strictSame(result, 'file content');
    test.end();
  });
});
