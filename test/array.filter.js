'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('successful filter', (test) => {
  const arr = [
    'Lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
  ];
  const expectedArr = [
    'Lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'elit',
    'sed',
    'do',
    'ut',
    'et',
    'magna',
  ];

  const shortEnough = (str, callback) =>
    process.nextTick(() => callback(null, str.length < 6));

  metasync.filter(arr, shortEnough, (err, res) => {
    test.error(err);
    test.same(res.join(), expectedArr.join());
    test.end();
  });
});

metatests.test('filter with empty array', (test) => {
  const arr = [];
  const expectedArr = [];

  const shortEnough = (str, callback) =>
    process.nextTick(() => callback(null, str.length < 6));

  metasync.filter(arr, shortEnough, (err, res) => {
    test.error(err);
    test.strictSame(res, expectedArr);
    test.end();
  });
});

metatests.test('successful filter', (test) => {
  const arr = [
    'Lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
  ];
  const filterError = new Error('Filter error');
  const expectedArr = [
    'Lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'elit',
    'sed',
    'magna',
  ];

  const maybeFail = (str, callback) =>
    process.nextTick(() => {
      if (str.length === 2) {
        callback(filterError);
        return;
      }
      callback(null, str.length < 6);
    });

  metasync.filter(arr, maybeFail, (err, res) => {
    test.error(err);
    test.same(res.join(), expectedArr.join());
    test.end();
  });
});
