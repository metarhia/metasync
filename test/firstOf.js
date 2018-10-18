'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('firstOf', test => {
  const returningFnIndex = 2;
  let dataReturned = false;

  const execUnlessDataReturned = data => callback => {
    if (dataReturned) {
      callback(null, data);
    } else {
      process.nextTick(execUnlessDataReturned);
    }
  };
  const makeIFn = i => callback => process.nextTick(() => {
    const iData = 'data' + i;
    if (i === returningFnIndex) {
      dataReturned = true;
      callback(null, iData);
    } else {
      execUnlessDataReturned(iData);
    }
  });

  const fns = [1, 2, 3].map(makeIFn);

  metasync.firstOf(fns, (err, data) => {
    test.error(err);
    test.strictSame(data, 'data2');
    test.end();
  });
});
