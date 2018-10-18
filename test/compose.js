'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('async parallel functions composition', test => {
  const data = { test: 'data' };
  const expectedData = { test: 'data', data1: 'data 1', data2: 'data 2' };

  const fn1 = (data, cb) => {
    process.nextTick(() => {
      cb(null, { data1: 'data 1' });
    });
  };

  const fn2 = (data, cb) => {
    process.nextTick(() => {
      cb(null, { data2: 'data 2' });
    });
  };

  const fc = metasync([[fn1, fn2]]);

  fc(data, (err, data) => {
    test.error(err);
    test.strictSame(data, expectedData);
    test.end();
  });
});

metatests.test('async complex functions composition', test => {

  const data = { test: 'data' };
  const expectedDataInFn1 = { test: 'data' };
  const expectedDataInFn2 = { test: 'data', data1: 'data 1' };
  const expectedDataInRes = { test: 'data' };

  let i;
  for (i = 1; i < 6; i++) {
    expectedDataInRes['data' + i] = 'data ' + i;
  }

  const fn1 = (data, cb) => {
    process.nextTick(() => {
      test.strictSame(data, expectedDataInFn1);
      cb(null, { data1: 'data 1' });
    });
  };

  const fn2 = (data, cb) => {
    process.nextTick(() => {
      test.strictSame(data, expectedDataInFn2);
      cb(null, { data2: 'data 2' });
    });
  };

  const fn3 = (data, cb) => {
    process.nextTick(() => {
      cb(null, { data3: 'data 3' });
    });
  };

  const fn4 = (data, cb) => {
    process.nextTick(() => {
      cb(null, { data4: 'data 4' });
    });
  };

  const fn5 = (data, cb) => {
    process.nextTick(() => {
      test.strictSame(data.data1, 'data 1');
      test.strictSame(data.data2, 'data 2');
      test.strictSame(data.data3, 'data 3');
      test.strictSame(data.data4, 'data 4');
      cb(null, { data5: 'data 5' });
    });
  };

  const fc = metasync([fn1, fn2, [[fn3, [fn4, fn5] ]], [], [[ ]] ]);
  fc(data, (err, data) => {
    test.error(err);
    test.strictSame(data, expectedDataInRes);
    test.end();
  });

});

const AC1 = 'async functions composition cancel before start';
metatests.test(AC1, test => {

  let count = 0;

  const fn1 = (data, cb) => {
    count++;
    process.nextTick(() => cb(null, 'data 1'));
  };

  const fn2 = (data, cb) => {
    count++;
    process.nextTick(() => cb(null, 'data 2'));
  };

  const fn3 = (data, cb) => {
    count++;
    process.nextTick(() => cb(null, 'data 3'));
  };

  const fn4 = (data, cb) => {
    count++;
    process.nextTick(() => cb(null, 'data 4'));
  };

  const fc = metasync([fn1, [[fn2, fn3]], fn4]);
  fc.cancel();
  fc({}, (err, data) => {
    test.isError(err);
    test.strictSame(data, undefined);
    test.strictSame(count, 0);
    test.end();
  });

});

const AC2 = 'async functions composition cancel in the middle';
metatests.test(AC2, test => {

  let count = 0;
  let finished = 0;

  const fn1 = (data, cb) => {
    count++;
    process.nextTick(() => {
      finished++;
      cb(null, 'data 1');
    });
  };

  const fn2 = (data, cb) => {
    count++;
    setTimeout(() => {
      finished++;
      cb(null, 'data 2');
    }, 200);
  };

  const fn3 = (data, cb) => {
    count++;
    setTimeout(() => {
      finished++;
      cb(null, 'data 3');
    }, 200);
  };

  const fn4 = (data, cb) => {
    count++;
    setTimeout(() => {
      finished++;
      cb(null, 'data 4');
    }, 200);
  };

  const fc = metasync([fn1, [[fn2, fn3]], fn4]);
  fc({}, (err, data) => {
    test.isError(err);
    test.strictSame(data, undefined);
    test.strictSame(count, 3);
    test.strictSame(finished, 1);
    test.end();
  });

  setTimeout(() => {
    fc.cancel();
  }, 100);

});

metatests.test('async functions composition cancel after end', test => {

  let count = 0;

  const fn1 = (data, cb) => {
    count++;
    process.nextTick(() => {
      cb(null, { data1: 'data 1' });
    });
  };

  const fn2 = (data, cb) => {
    count++;
    process.nextTick(() => {
      cb(null, { data2: 'data 2' });
    });
  };

  const fn3 = (data, cb) => {
    count++;
    process.nextTick(() => {
      cb(null, { data3: 'data 3' });
    });
  };

  const fn4 = (data, cb) => {
    count++;
    process.nextTick(() => {
      cb(null, { data4: 'data 4' });
    });
  };

  const fc = metasync([fn1, [[fn2, fn3]], fn4]);
  fc({}, (err, data) => {
    test.error(err);
    test.strictSame(data, {
      data1: 'data 1',
      data2: 'data 2',
      data3: 'data 3',
      data4: 'data 4',
    });
    test.strictSame(count, 4);
    test.end();
  });

  setTimeout(() => {
    fc.cancel();
  }, 100);

});

metatests.test('async functions composition to array', test => {

  let count = 0;

  const fn1 = (data, cb) => {
    count++;
    process.nextTick(() => cb(null, 'data 1'));
  };

  const fn2 = (data, cb) => {
    count++;
    process.nextTick(() => cb(null, 'data 2'));
  };

  const fn3 = (data, cb) => {
    count++;
    process.nextTick(() => cb(null, 'data 3'));
  };

  const fn4 = (data, cb) => {
    count++;
    process.nextTick(() => cb(null, 'data 4'));
  };

  const fc = metasync([fn1, [[fn2, fn3]], fn4]);
  fc(['data 0'], (err, data) => {
    test.error(err);
    test.strictSame(data, ['data 0', 'data 1', 'data 2', 'data 3', 'data 4']);
    test.strictSame(count, 4);
    test.end();
  });

});
