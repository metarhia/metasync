'use strict';

const metasync = require('..');
const fs = require('fs');
const metatests = require('metatests');
const path = require('path');
const ASYNC_TIMEOUT = 200;

// Data Collector

metatests.test('dataCollector / simple', test => {
  const dataCollector = metasync.collect(4).done((err, data) => {
    test.error(err);
    test.strictSame(Object.keys(data).length, 4);
    test.end();
  });

  dataCollector.collect('user', null, { name: 'Marcus Aurelius' });

  fs.readFile(path.join(__dirname, '..', 'README.md'), (err, data) => {
    dataCollector.collect('readme', err, data);
  });

  fs.readFile(path.join(__dirname, '..', 'AUTHORS'), (err, data) => {
    dataCollector.collect('authors', err, data);
  });

  setTimeout(() => {
    dataCollector.pick('timer', { date: new Date() });
  }, ASYNC_TIMEOUT);
});

metatests.test('data collector / timeout', test => {
  const expectedErr = new Error('Metasync: Collector timed out');
  const expectedData = { user: { name: 'Marcus Aurelius' } };

  const dataCollector = metasync
    .collect(4)
    .timeout(1000)
    .done((err, data) => {
      test.isError(err, expectedErr);
      test.strictSame(data, expectedData);
      test.end();
    });

  dataCollector.pick('user', { name: 'Marcus Aurelius' });
});

metatests.test('data collector / error', test => {
  const expectedErr = new Error('User not found');
  const expectedData = { file: 'file content' };

  const dataCollector = metasync.collect(4).done((err, data) => {
    test.isError(err, expectedErr);
    test.strictSame(data, expectedData);
    test.end();
  });

  dataCollector.pick('file', 'file content');
  dataCollector.fail('user', new Error('User not found'));
  dataCollector.pick('score', 1000);
  dataCollector.fail('tcp', new Error('No socket'));
});

// Key Collector

metatests.test('key collector / simple', test => {
  const keyCollector = metasync
    .collect(['user', 'readme'])
    .timeout(1000)
    .done((err, data) => {
      test.error(err);
      test.strictSame(Object.keys(data).length, 2);
      test.end();
    });

  keyCollector.pick('user', { name: 'Marcus Aurelius' });

  fs.readFile(path.join(__dirname, '..', 'README.md'), (err, data) => {
    test.error(err);
    keyCollector.pick('readme', data);
  });
});

// Parallel execution

metatests.test('parallel', test => {
  test.plan(5);

  const expectedData = {
    data1: 'result1',
    data2: 'result2',
    data3: 'result3',
    arg: 'arg',
  };

  const pf1 = (data, callback) => {
    test.pass('must call');
    setTimeout(() => callback(null, { data1: 'result1' }), ASYNC_TIMEOUT);
  };

  const pf2 = (data, callback) => {
    test.pass('must call');
    setTimeout(() => callback(null, { data2: 'result2' }), ASYNC_TIMEOUT);
  };

  const pf3 = (data, callback) => {
    test.pass('must call');
    setTimeout(() => callback(null, { data3: 'result3' }), ASYNC_TIMEOUT);
  };

  metasync.parallel([pf1, pf2, pf3], { arg: 'arg' }, (err, data) => {
    test.error(err);
    test.strictSame(data, expectedData);
  });
});

// Sequential execution

metatests.test('sequential', test => {
  test.plan(5);

  const sf1 = (data, callback) => {
    test.strictSame(data, ['arg']);
    setTimeout(() => callback(null, 'result1'), ASYNC_TIMEOUT);
  };

  const sf2 = (data, callback) => {
    test.pass('must call');
    setTimeout(() => callback(null, 'result2'), ASYNC_TIMEOUT);
  };

  const sf3 = (data, callback) => {
    test.strictSame(data, ['arg', 'result1', 'result2']);
    setTimeout(() => callback(null, 'result3'), ASYNC_TIMEOUT);
  };

  metasync.sequential([sf1, sf2, sf3], ['arg'], (err, data) => {
    test.error(err);
    test.strictSame(data, ['arg', 'result1', 'result2', 'result3']);
  });
});

// Asynchrous filter

metatests.test('asynchronus filter', test => {
  const dataToFilter = [
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

  const expectedResult = [
    'Lorem',
    'ipsum',
    'sit',
    'amet',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'ut',
    'labore',
    'et',
  ];

  const filterPredicate = (item, callback) => {
    // filter words which consists of unique letters only
    const letters = [];
    for (let i = 0; i < item.length; ++i) {
      if (letters.includes(item[i].toLowerCase())) break;
      letters.push(item[i].toLowerCase());
    }

    setTimeout(
      () => callback(null, letters.length === item.length),
      ASYNC_TIMEOUT
    );
  };

  metasync.filter(dataToFilter, filterPredicate, (err, result) => {
    test.error(err);
    test.strictSame(result, expectedResult);
    test.end();
  });
});

// Asynchrous find

metatests.test('asynchronus find', test => {
  metasync.find(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    (item, callback) => callback(null, item % 3 === 0 && item % 5 === 0),
    (err, result) => {
      test.error(err);
      test.strictSame(result, 15);
      test.end();
    }
  );
});

// Asynchrous some
metatests.test('asynchronus some', test => {
  metasync.some(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    (item, callback) => {
      const res = item % 3 === 0 && item % 5 === 0;
      callback(null, res);
    },
    (err, result) => {
      test.error(err);
      test.strictSame(result, true);
      test.end();
    }
  );
});

// Asyncronous each in parallel

metatests.test('asyncronous each', test => {
  const result = {};
  metasync.each(
    ['a', 'b', 'c'],
    (item, callback) => {
      result[item] = item;
      callback(null);
    },
    err => {
      test.error(err);
      test.strictSame(result, { a: 'a', b: 'b', c: 'c' });
      test.end();
    }
  );
});

// Asyncronous series (sequential)

metatests.test('asynchronus series', test => {
  const result = [];
  metasync.series(
    ['a', 'b', 'c', 'd'],
    (item, callback) => {
      result.push(item.toUpperCase());
      callback(null);
    },
    err => {
      test.error(err);
      test.strictSame(result, ['A', 'B', 'C', 'D']);
      test.end();
    }
  );
});

// Asyncronous reduce (sequential)

metatests.test('asynchronus reduce', test => {
  metasync.reduce(
    ['a', 'b', 'c', 'd'],
    (prev, curr, callback) => {
      callback(null, prev + curr);
    },
    (err, data) => {
      test.error(err);
      test.strictSame(data, 'abcd');
      test.end();
    }
  );
});

// Queue

metatests.test('queue / simple', test => {
  const expectedResult = [1, 2, 3, 4, 5, 6, 8, 9];
  const result = [];

  const queue = metasync
    .queue(3)
    .process((item, callback) => {
      result.push(item.id);
      setTimeout(callback, 100);
    })
    .drain(() => {
      test.strictSame(result, expectedResult);
      test.end();
    });

  queue.add({ id: 1 });
  queue.add({ id: 2 });
  queue.add({ id: 3 });
  queue.add({ id: 4 });
  queue.add({ id: 5 });
  queue.add({ id: 6 });
  queue.add({ id: 8 });
  queue.add({ id: 9 });
});

metatests.test('queue / pause', test => {
  const expectedResult = [1, 3, 4, 7, 8, 9];
  const result = [];

  const queue = metasync
    .queue(3)
    .process((item, callback) => {
      result.push(item.id);
      setTimeout(callback, 100);
    })
    .drain(() => {
      test.strictSame(result, expectedResult);
      test.end();
    });

  queue.add({ id: 1 });
  queue.pause();

  queue.add({ id: 2 });

  queue.resume();

  queue.add({ id: 3 });
  queue.add({ id: 4 });
  queue.add({ id: 5 });
  queue.add({ id: 6 });

  queue.clear();

  queue.add({ id: 7 });
  queue.add({ id: 8 });
  queue.add({ id: 9 });
});

// Trottle

metatests.test('trottle', test => {
  const expectedResult = ['A', 'E', 'F', 'I'];
  const result = [];
  let state;

  const fn = () => {
    result.push(state);
  };

  const f1 = metasync.throttle(500, fn);

  // to be called 2 times (first and last: A and E)
  state = 'A';
  f1();
  state = 'B';
  f1();
  state = 'C';
  f1();
  state = 'D';
  f1();
  state = 'E';
  f1();

  // to be called 2 times (last will be I)
  setTimeout(() => {
    state = 'F';
    f1();
  }, 600);
  setTimeout(() => {
    state = 'G';
    f1();
  }, 700);
  setTimeout(() => {
    state = 'H';
    f1();
  }, 1000);
  setTimeout(() => {
    state = 'I';
    f1();
  }, 1100);

  setTimeout(() => {
    test.strictSame(result, expectedResult);
    test.end();
  }, 2000);
});

// Debounce

metatests.test('debounce', test => {
  const expectedResult = ['E', 'I'];
  const result = [];
  let state;

  const fn = () => {
    result.push(state);
  };

  const f1 = metasync.debounce(500, fn, ['I']);

  // to be called one time (E)
  state = 'A';
  f1();
  state = 'B';
  f1();
  state = 'C';
  f1();
  state = 'D';
  f1();
  state = 'E';
  f1();

  // to be called one time (I)
  setTimeout(() => {
    state = 'F';
    f1();
  }, 600);
  setTimeout(() => {
    state = 'G';
    f1();
  }, 700);
  setTimeout(() => {
    state = 'H';
    f1();
  }, 1000);
  setTimeout(() => {
    state = 'I';
    f1();
  }, 1100);

  setTimeout(() => {
    test.strictSame(result, expectedResult);
    test.end();
  }, 2000);
});

// Map

metatests.test('asynchronus map / simple', test => {
  metasync.map(
    [1, 2, 3],
    (item, callback) => {
      setTimeout(() => {
        callback(null, item * item);
      }, item * 10);
    },
    (error, result) => {
      test.error(error);
      test.strictSame(result, [1, 4, 9]);
      test.end();
    }
  );
});

metatests.test('asynchronus map / error', test => {
  metasync.map(
    [1, 2, 3],
    (item, callback) => {
      setTimeout(() => {
        if (item === 2) {
          callback(new Error());
        } else {
          callback(null, item);
        }
      }, item * 10);
    },
    (error, result) => {
      test.isError(error);
      test.strictSame(result, undefined);
      test.end();
    }
  );
});

// Timeout

metatests.test('timeout', test => {
  metasync.timeout(
    200,
    done => {
      setTimeout(done, 300);
    },
    err => {
      const expectedErr = new Error(
        'Metasync: asynchronous function timed out'
      );
      test.isError(err, expectedErr);
      test.end();
    }
  );
});
