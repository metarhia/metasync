'use strict';

api.metatests.test('successful filter', (test) => {
  const arr = [
    'Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
    'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor',
    'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua',
  ];
  const expectedArr = [
    'Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'elit', 'sed',
    'do', 'ut', 'et', 'magna'
  ];

  api.metasync.filter(arr, (str, callback) => process.nextTick(() => (
    callback(null, str.length < 6)
  )), (err, res) => {
    if (err) test.notOk(err.toString());
    //test.error(err);
    test.same(res.join(), expectedArr.join());
    test.end();
  });
});

api.metatests.test('filter with empty array', (test) => {
  const arr = [];
  const expectedArr = [];

  api.metasync.filter(arr, (str, callback) => process.nextTick(() => (
    callback(null, str.length < 6)
  )), (err, res) => {
    if (err) test.notOk(err.toString());
    //test.error(err);
    test.strictSame(res, expectedArr);
    test.end();
  });
});

api.metatests.test('successful filter', (test) => {
  const arr = [
    'Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
    'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor',
    'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua',
  ];
  const filterError = new Error('Filter error');
  const expectedArr = [
    'Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'elit', 'sed', 'magna'
  ];

  api.metasync.filter(arr, (str, callback) => process.nextTick(() => {
    if (str.length === 2) {
      callback(filterError);
      return;
    }
    callback(null, str.length < 6);
  }), (err, res) => {
    test.same(res.join(), expectedArr.join());
    test.end();
  });
});
