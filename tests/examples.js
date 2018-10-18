'use strict';

const metasync = require('..');
const fs = require('fs');
const assert = require('assert');
const ASYNC_TIMEOUT = 200;

// assert.deepStrictEqual polyfill for pre-io.js
if (!assert.deepStrictEqual) {
  assert.deepStrictEqual = (actual, expected, message) => {
    const actualKeys = Object.keys(actual);
    const expectedKeys = Object.keys(expected);
    assert.strictEqual(actualKeys.length, expectedKeys.length, message);
    let i, key;
    for (i = 0; i < actualKeys.length; i++) {
      key = actualKeys[i];
      assert.strictEqual(actual[key], expected[key], message);
    }
  };
}

// Data Collector

const dataCollectorTest = end => {

  const dataCollector = new metasync.DataCollector(4);

  dataCollector.on('done', (errs, data) => {
    assert.ifError(errs);
    console.dir({
      dataKeys: Object.keys(data),
    });
    console.log('DataCollector test done');
    end();
  });

  dataCollector.collect('user', { name: 'Marcus Aurelius' });

  fs.readFile('HISTORY.md', (err, data) => {
    assert.ifError(err);
    dataCollector.collect('history', data);
  });

  fs.readFile('README.md', (err, data) => {
    assert.ifError(err);
    dataCollector.collect('readme', data);
  });

  setTimeout(() => {
    dataCollector.collect('timer', { date: new Date() });
  }, ASYNC_TIMEOUT);

};

const dataCollectorTimeoutTest = end => {

  const dataCollector = new metasync.DataCollector(4, 1000);

  dataCollector.on('timeout', (err, data) => {
    console.dir({
      err: err ? err.toString() : null,
      dataKeys: Object.keys(data),
    });
    console.log('Collector timeout test done');
    end();
  });

  dataCollector.collect('user', { name: 'Marcus Aurelius' });

};

const dataCollectorErrorTest = end => {

  const dataCollector = new metasync.DataCollector(4);

  dataCollector.on('error', (err, key) => {
    console.dir({
      err: err ? err.toString() : null,
      key,
    });
  });

  dataCollector.on('done', (errs, data) => {
    console.dir({
      errorKeys: errs ? Object.keys(errs) : null,
      dataKeys: Object.keys(data),
    });
    console.log('Collector Error test done');
    end();
  });

  dataCollector.collect('user', new Error('User not found'));
  dataCollector.collect('file', 'file content');
  dataCollector.collect('score', 1000);
  dataCollector.collect('tcp', new Error('No socket'));

};

// Key Collector

const keyCollectorTest = end => {

  const keyCollector = new metasync.KeyCollector(['user', 'history'], 1000);

  keyCollector.on('done', (errs, data) => {
    assert.ifError(errs);
    console.dir({
      dataKeys: Object.keys(data),
    });
    console.log('KeyCollector test done');
    end();
  });

  keyCollector.collect('user', { name: 'Marcus Aurelius' });

  fs.readFile('HISTORY.md', (err, data) => {
    assert.ifError(err);
    keyCollector.collect('history', data);
  });

};

// Parallel execution

const parallelTest = end => {

  const pf1 = (data, callback) => {
    console.log('pf1');
    setTimeout(() => callback('result1'), ASYNC_TIMEOUT);
  };

  const pf2 = (data, callback) => {
    console.log('pf2');
    setTimeout(() => callback('result2'), ASYNC_TIMEOUT);
  };

  const pf3 = (data, callback) => {
    console.log('pf3');
    setTimeout(() => callback('result3'), ASYNC_TIMEOUT);
  };

  metasync.parallel([pf1, pf2, pf3], () => {
    console.log('Parallel test done');
    end();
  });

};

// Sequential execution

const sequentialTest = end => {

  const sf1 = (data, callback) => {
    console.log('sf1');
    setTimeout(() => callback('result1'), ASYNC_TIMEOUT);
  };

  const sf2 = (data, callback) => {
    console.log('sf2');
    setTimeout(() => callback('result2'), ASYNC_TIMEOUT);
  };

  const sf3 = (data, callback) => {
    console.log('sf3');
    setTimeout(() => callback('result3'), ASYNC_TIMEOUT);
  };

  metasync.sequential([sf1, sf2, sf3], () => {
    console.log('Sequential test done');
    end();
  });

};

// Asynchrous filter

const filterTest = end => {

  const dataToFilter = [
    'Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
    'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor',
    'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua',
  ];

  const filterPredicate = (item, callback) => {
    // filter words which consists of unique letters only
    const letters = [];
    console.log('checking value: ' + item);
    let i;
    for (i = 0; i < item.length; ++i) {
      if (letters.includes(item[i].toLowerCase())) break;
      letters.push(item[i].toLowerCase());
    }

    setTimeout(
      () => callback(null, letters.length === item.length),
      ASYNC_TIMEOUT
    );
  };

  metasync.filter(dataToFilter, filterPredicate, (err, result) => {
    assert.ifError(err);
    console.log('filtered array: ' + result);
    console.log('Filter test done');
    end();
  });

};

// Asynchrous find

const findTest = end => {

  metasync.find(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    (item, callback) => callback(null, item % 3 === 0 && item % 5 === 0),
    (err, result) => {
      assert.ifError(err);
      console.log('found value: ' + result);
      console.log('Find test done');
      end();
    }
  );

};

// Asynchrous some
const someTest = end => {
  metasync.some(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    (item, callback) => {
      const res = item % 3 === 0 && item % 5 === 0;
      console.log('Some test ' + item + ': ' + res);
      callback(null, res);
    },
    (err, result) => {
      assert.ifError(err);
      console.log('Value ' + (result ? 'found' : 'not found'));
      console.log('Some test done');
      end();
    }
  );
};

// Asyncronous each in parallel

const eachTest = end => {

  metasync.each(
    ['a', 'b', 'c'],
    (item, callback) => {
      console.dir({ each: item });
      callback();
    },
    (/*data*/) => {
      console.log('Each test done');
      end();
    }
  );

};

// Asyncronous series (sequential)

const seriesTest = end => {

  metasync.series(
    //['a', 'b', 'c'],
    new Array(5000),
    (item, callback) => {
      //console.dir({ series: item });
      callback();
    },
    (/*data*/) => {
      console.log('Series test done');
      end();
    }
  );

};

// Asyncronous reduce (sequential)

const reduceTest = end => {

  metasync.reduce(
    ['a', 'b', 'c'],
    (prev, curr, callback) => {
      console.dir({ reduce: { prev, curr } });
      callback(null, curr);
    },
    (/*err, data*/) => {
      console.log('Reduce test done');
      end();
    }
  );

};

const concurrentQueueTest = end => {

  const queue = new metasync.ConcurrentQueue(3, 2000);

  queue.on('process', (item, callback) => {
    setTimeout(() => {
      console.dir({ item });
      callback();
    }, 100);
  });

  queue.on('timeout', () => {
    console.log('ConcurrentQueue timed out');
  });

  queue.on('empty', () => {
    console.log('ConcurrentQueue test done');
    end();
  });

  queue.add({ id: 1 });
  queue.add({ id: 2 });
  queue.add({ id: 3 });
  queue.add({ id: 4 });
  queue.add({ id: 5 });
  queue.add({ id: 6 });
  queue.add({ id: 8 });
  queue.add({ id: 9 });
};

const concurrentQueuePauseResumeStopTest = end => {
  const queue =  new metasync.ConcurrentQueue(3, 2000);
  queue.pause();
  queue.on('empty', end);
  if (!queue.events.empty) {
    console.log('ConcurrentQueue pause test done');
  }
  queue.resume();
  queue.on('empty', end);
  if (queue.events.empty) {
    console.log('ConcurrentQueue resume test done');
  }
  queue.stop();
  if (queue.count === 0) {
    console.log('ConcurrentQueue stop test done');
  }
};

const throttleTest = end => {
  let state;

  const fn = letter => {
    console.log('Throttled function, state: ' + state);
    if (state === letter) {
      console.log('Throttle test done');
      end();
    }
  };

  const f1 = metasync.throttle(500, fn, ['I']);

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

};

const debounceTest = end => {
  let state;

  const fn = letter => {
    console.log('Debounced function, state: ' + state);
    if (state === letter) {
      console.log('Debounce test done');
      end();
    }
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
};

const mapTest = end => {
  metasync.map([1, 2, 3], (item, callback) => {
    setTimeout(() => {
      callback(null, item * item);
    }, item * 10);
  }, (error, result) => {
    assert.ifError(error);
    assert.deepStrictEqual(result, [1, 4, 9]);
    console.log('Map test #1 done');
  });

  metasync.map([1, 2, 3], (item, callback) => {
    setTimeout(() => {
      if (item === 2) {
        callback(new Error());
      } else {
        callback(null, item);
      }
    }, item * 10);
  }, (error, result) => {
    assert.ok(error);
    assert.ifError(result);
    console.log('Map test #2 done');
    end();
  });
};

const timeoutTest = end => {
  // Done function called by timer
  const start1 = new Date();
  metasync.timeout(200, done => {
    setTimeout(done, 300);
  }, () => {
    const timeDiff = new Date() - start1;
    assert(timeDiff < 250);
    console.log('Timout test #1 done');
  });

  // Done function called by async function
  const start2 = new Date();
  metasync.timeout(300, done => setTimeout(done, 200), () => {
    const timeDiff = new Date() - start2;
    assert(timeDiff < 250);
    console.log('Timout test #2 done');
    end();
  });
};

const printCallbackArgs = end => (err, ...args) => {
  if (err) {
    console.log('Error: ' + err);
    return;
  }
  console.log(...args);
  console.log('done');
  end();
};

const ofTest = end => {
  console.log('of test:');
  metasync.monad.of(4, 'str', [1, 2, 3])(printCallbackArgs(end));
};

const fmapTest = end => {
  console.log('fmap test:');
  const of = metasync.monad.of;
  const args = [4, 'str', [1, 2, 3]];
  const reverseArgs = (...args) => args.reverse();
  of(...args).fmap(reverseArgs)(printCallbackArgs(end));
};

const monadChainTest = end => {
  console.log('Monad concat test:');
  const M = metasync.monad;
  const args = [4, 'str', [1, 2, 3]];
  const asyncPrint = M.toAsync(
    (args, callback) => printCallbackArgs(callback)(null, ...args)
  );
  M.of(...args).concat(asyncPrint)(end);
};

const apTest = end => {
  console.log('ap test:');
  const M = metasync.monad;
  const storage = {};

  const collect = (key, val) => {
    if (key === undefined) return null;
    storage[key] = val;
    return collect;
  };

  const arrOfAsyncFunctions = [
    ['first', 1], ['second', 2], ['third', 3],
  ].map(args => M.of(...args));
  const apR = (prev, next) => M.ap(next, prev);

  arrOfAsyncFunctions.reduce(apR, M.of(collect))(() => {
    console.log(storage);
    console.log('done');
    end();
  });
};

const cbTest = end => {
  const fn1 = undefined;
  const fn2 = null;
  const fn3 = (err, data) => {
    assert.ifError(err);
    console.log('Done callback test ' + data);
  };

  const cb1 = metasync.cb(fn1);
  const cb2 = metasync.cb(fn2);
  const cb3 = metasync.cb(fn3);

  cb1(null, 'ok');
  cb2(null, 'ok');
  cb3(null, 'ok');
  cb3(null, 'ok');

  end();
};

// Run tests

metasync([
  cbTest,
  dataCollectorTest,
  dataCollectorTimeoutTest,
  dataCollectorErrorTest,
  keyCollectorTest,
  parallelTest,
  sequentialTest,
  filterTest,
  findTest,
  someTest,
  eachTest,
  seriesTest,
  reduceTest,
  concurrentQueueTest,
  ofTest,
  fmapTest,
  monadChainTest,
  apTest,
  concurrentQueuePauseResumeStopTest,
  throttleTest,
  debounceTest,
  mapTest,
  timeoutTest,
], () => {
  console.log('All tests done');
});
