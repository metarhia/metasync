'use strict';

const assert = require('assert');
const metasync = require('..');

let counter = 0;

const fn1 = (data, cb) => {
  counter++;
  assert.strictEqual(data.test, 'data');
  cb(null, { data });
};

const fn2 = (data, cb) => {
  counter++;
  assert.strictEqual(data.test, 'data');
  cb(null, { data });
};

const fn3 = (data, cb) => {
  counter++;
  assert.strictEqual(data.test, 'data');
  cb(null, { data });
};

const fn4 = (data, cb) => {
  counter++;
  assert.strictEqual(data.test, 'data');
  cb(null, { data });
};

const fc = metasync.flow([fn1, [[fn2, fn3]], fn4]);

fc({ test: 'data' }, (err, data) => {
  assert(data);
  assert.strictEqual(counter, 4);
});
