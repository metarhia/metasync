'use strict';

const metatests = require('metatests');
const metasync = require('..');

metatests.test('sequential functions', test => {
  const f1 = test.mustCall((c, cb) => cb());
  const f2 = test.mustCall((c, cb) => cb());
  const f3 = test.mustCall((c, cb) => cb());
  const f4 = test.mustCall((c, cb) => cb());

  const fc = metasync([f1, f2, f3, f4]);

  fc((err, context) => {
    test.error(err);
    test.strictSame(context, {});
    test.end();
  });
});
