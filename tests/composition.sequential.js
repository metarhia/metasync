'use strict';

const assert = require('assert');
const metasync = require('..');

const f1 = (c, cb) => cb();
const f2 = (c, cb) => cb();
const f3 = (c, cb) => cb();
const f4 = (c, cb) => cb();

const fc = metasync([f1, f2, f3, f4]);

fc((err, context) => {
  assert.ifError(err);
  assert.deepEqual(context, {});
});
