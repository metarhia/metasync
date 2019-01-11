'use strict';

const metatests = require('metatests');
const metasync = require('..');

// Emulate Asynchronous calls of function
//   callback - function
const wrapAsync = callback => {
  setTimeout(callback, Math.floor(Math.random() * 500));
};

metatests.test('async complex functions composition', test => {
  const fn1 = test.mustCall((data, cb) => {
    wrapAsync(() => {
      cb(null, 1);
    });
  });

  const fn2 = test.mustCall((data, cb) => {
    wrapAsync(() => {
      cb(null, 2);
    });
  });

  const fn3 = test.mustCall((data, cb) => {
    test.strictSame(data.length, 2);
    wrapAsync(() => {
      cb(null, 3);
    });
  });

  const fn4 = test.mustCall((data, cb) => {
    wrapAsync(() => {
      cb(null, 4);
    });
  });

  const fc = metasync([[[fn1, fn2]], fn3, fn4]);

  fc([], (err, data) => {
    test.error(err);
    test.strictSame(data.length, 4);
    test.end();
  });
});
