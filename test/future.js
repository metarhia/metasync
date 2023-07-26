'use strict';

const { Future, futurify } = require('..');
const metatests = require('metatests');

metatests.test('Future map/run', async test => {
  Future.of(3)
    .map(x => x ** 2)
    .run(value => {
      test.strictSame(value, 9);
      test.end();
    });
});

metatests.test('Future lazy', async test => {
  Future.of(3).map(test.mustNotCall());
  test.end();
});

metatests.test('Future resolve', async test => {
  new Future(resolve => {
    setTimeout(() => {
      resolve(5);
    }, 0);
  }).run(value => {
    test.strictSame(value, 5);
    test.end();
  }, test.mustNotCall());
});

metatests.test('Future reject', async test => {
  new Future((resolve, reject) => {
    reject(new Error('msg'));
  }).run(test.mustNotCall(), error => {
    test.strictSame(error.message, 'msg');
    test.end();
  });
});

metatests.test('Future error', async test => {
  Future.err(new Error('msg')).run(test.mustNotCall(), error => {
    test.strictSame(error.message, 'msg');
    test.end();
  });
});

metatests.test('Future promise', async test => {
  const value = await Future.of(6)
    .map(x => ++x)
    .map(x => x ** 3)
    .promise();

  test.strictSame(value, 343);
  test.end();
});

metatests.test('Future catch', async test => {
  Future.of(6)
    .map(() => {
      throw new Error('msg');
    })
    .run(test.mustNotCall, error => {
      test.strictSame(error.message, 'msg');
      test.end();
    });
});

metatests.test('Future stateless', async test => {
  const f1 = Future.of(3);
  const f2 = f1.map(x => ++x);
  const f3 = f2.map(x => x ** 3);
  const f4 = f1.map(x => x * 2);

  f1.run(value => {
    test.strictSame(value, 3);
  });

  f1.run(value => {
    test.strictSame(value, 3);
  });

  f2.run(value => {
    test.strictSame(value, 4);
  });

  f2.run(value => {
    test.strictSame(value, 4);
  });

  f3.run(value => {
    test.strictSame(value, 64);
  });

  f4.run(value => {
    test.strictSame(value, 6);
  });

  test.end();
});

metatests.test('Future futurify success', async test => {
  const f1 = (a, b, callback) => {
    if (typeof a !== 'number' || typeof b !== 'number') {
      callback(new Error('Arguments must be numbers'));
      return;
    }
    callback(null, a + b);
  };

  const f2 = futurify(f1);

  f2(10, 20).run(value => {
    test.strictSame(value, 30);
    test.end();
  });
});

metatests.test('Future futurify fail', async test => {
  const f1 = (a, b, callback) => {
    if (typeof a !== 'number' || typeof b !== 'number') {
      callback(new Error('Arguments must be numbers'));
      return;
    }
    callback(null, a + b);
  };

  const f2 = futurify(f1);

  f2('10', '20').run(test.mustNotCall, error => {
    test.strictSame(error.message, 'Arguments must be numbers');
    test.end();
  });
});
