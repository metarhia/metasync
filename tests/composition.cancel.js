'use strict';

const assert = require('assert');
const metasync = require('..');

const wrapAsync = callback => {
  setTimeout(callback, Math.floor(Math.random() * 500));
};

let fc = null;

const fn1 = (data, cb) => {
  wrapAsync(() => {
    assert.ok('fn1');
    cb(null, 1);
  });
};

const fn2 = (data, cb) => {
  wrapAsync(() => {
    assert.ok('fn2');
    if (fc) fc.cancel();
    cb(null, 2);
  });
};

const fn3 = (data, cb) => {
  wrapAsync(() => {
    assert.fail('fn3');
    cb(null, 3);
  });
};

const fn4 = (data, cb) => {
  wrapAsync(() => {
    assert.fail('fn4');
    cb(null, 4);
  });
};

fc = metasync([fn1, fn2, fn3, fn4]);

fc([], (err, data) => {
  assert.ok(err);
  assert.equal(data, undefined);
});
