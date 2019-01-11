'use strict';

const metasync = require('..');
const metatests = require('metatests');

// Emulate Asynchronous calls of function
//   callback - function
const wrapAsync = callback => {
  setTimeout(callback, Math.floor(Math.random() * 500));
};

metatests.test('async functions composition cancel in the middle', test => {
  let fc = null;
  const fn1 = test.mustCall((data, cb) => {
    wrapAsync(() => {
      cb(null, 1);
    });
  });

  const fn2 = test.mustCall((data, cb) => {
    test.strictSame(data, [1]);
    wrapAsync(() => {
      if (fc) fc.cancel();
      cb(null, 2);
    });
  });

  const fn3 = test.mustNotCall();
  const fn4 = test.mustNotCall();

  fc = metasync([fn1, fn2, fn3, fn4]);

  fc([], (err, data) => {
    test.isError(err, new Error('Metasync: asynchronous composition canceled'));
    test.strictSame(data, undefined);
    test.end();
  });
});
