'use strict';

const metasync = require('..');
const metatests = require('metatests');

// Emulate Asynchronous calls of function
//   callback - <Function>
const wrapAsync = callback => {
  setTimeout(callback, Math.floor(Math.random() * 500));
};

metatests.test('simple chain/do', test => {
  const readConfig = test.mustCall((name, callback) => {
    test.strictSame(name, 'myConfig');
    wrapAsync(() => {
      callback(null, { name });
    });
  });

  const selectFromDb = test.mustCall((query, callback) => {
    test.strictSame(query, 'select * from cities');
    wrapAsync(() => {
      callback(null, [{ name: 'Kiev' }, { name: 'Roma' }]);
    });
  });

  const getHttpPage = test.mustCall((url, callback) => {
    test.strictSame(url, 'http://kpi.ua');
    wrapAsync(() => {
      callback(null, '<html>Some archaic web here</html>');
    });
  });

  const readFile = test.mustCall((path, callback) => {
    test.strictSame(path, 'README.md');
    wrapAsync(() => {
      callback(null, 'file content');
    });
  });

  const c1 = metasync
    .do(readConfig, 'myConfig')
    .do(selectFromDb, 'select * from cities')
    .do(getHttpPage, 'http://kpi.ua')
    .do(readFile, 'README.md');

  c1((err, result) => {
    test.error(err);
    test.strictSame(result, 'file content');
    test.end();
  });
});
