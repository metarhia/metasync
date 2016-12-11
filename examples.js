'use strict';

var metasync = require('./metasync');
var fs = require('fs');
var assert = require('assert');
var ASYNC_TIMEOUT = 200;

// assert.deepStrictEqual polyfill for pre-io.js
if (!assert.deepStrictEqual) {
  assert.deepStrictEqual = function(actual, expected, message) {
    var actualKeys = Object.keys(actual);
    var expectedKeys = Object.keys(expected);
    assert.strictEqual(actualKeys.length, expectedKeys.length, message);
    for (var i = 0; i < actualKeys.length; i++) {
      var key = actualKeys[i];
      assert.strictEqual(actual[key], expected[key], message);
    }
  };
}

// Functional Asyncronous Composition

function compositionTest(end) {

  metasync.composition(
    [f1, f2, f3, [[f4, f5, [f6, f7], f8]], [[f9, f10]], f11],
    function(data) {
      console.dir(data);
    }
  );

  function f1(callback) {
    console.log('f1');
    setTimeout(function() {
      callback('result1');
    }, ASYNC_TIMEOUT);
  }

  function f2(data, callback) {
    console.log('f2');
    setTimeout(function() {
      callback('result2');
    }, ASYNC_TIMEOUT);
  }

  function f3(data, callback) {
    console.log('f3');
    setTimeout(function() {
      data.third = 'result3';
      callback();
    }, ASYNC_TIMEOUT);
  }

  function f4(callback) {
    console.log('f4');
    setTimeout(function() {
      callback();
    }, ASYNC_TIMEOUT);
  }

  function f5(data, callback) {
    console.log('f5');
    setTimeout(function() {
      callback(5);
    }, ASYNC_TIMEOUT);
  }

  function f6(data, callback) {
    console.log('f6');
    setTimeout(function() {
      callback('result6');
    }, ASYNC_TIMEOUT);
  }

  function f7(data, callback) {
    console.log('f7');
    setTimeout(function() {
      callback('result7');
    }, ASYNC_TIMEOUT);
  }

  function f8(data, callback) {
    console.log('f8');
    setTimeout(function() {
      callback('result8');
    }, ASYNC_TIMEOUT);
  }

  function f9(data, callback) {
    console.log('f9');
    setTimeout(function() {
      callback('result9');
    }, ASYNC_TIMEOUT);
  }

  function f10(data, callback) {
    console.log('f10');
    setTimeout(function() {
      callback('result10');
    }, ASYNC_TIMEOUT);
  }

  function f11(data, callback) {
    console.log('f11');
    setTimeout(function() {
      callback('result11');
      console.log('Composition test done');
      end();
    }, ASYNC_TIMEOUT);
  }

}

// Data Collector

function collectorTest(end) {

  var dataCollector = new metasync.DataCollector(4);

  dataCollector.on('done', function(errs, data) {
    console.dir({
      dataKeys: Object.keys(data)
    });
    console.log('Collector test done');
    end();
  });

  dataCollector.collect('user', { name: 'Marcus Aurelius' });

  fs.readFile('HISTORY.md', function(err, data) {
    dataCollector.collect('history', data);
  });

  fs.readFile('README.md', function(err, data) {
    dataCollector.collect('readme', data);
  });

  setTimeout(function() {
    dataCollector.collect('timer', { date: new Date() });
  }, ASYNC_TIMEOUT);

}

function collectorTimeoutTest(end) {

  var dataCollector = new metasync.DataCollector(4, 1000);

  dataCollector.on('timeout', function(err, data) {
    console.dir({
      err: err ? err.toString() : null,
      dataKeys: Object.keys(data)
    });
    console.log('Collector timeout test done');
    end();
  });

  dataCollector.collect('user', { name: 'Marcus Aurelius' });

}

function collectorErrorTest(end) {

  var dataCollector = new metasync.DataCollector(4);

  dataCollector.on('error', function(err, key) {
    console.dir({
      err: err ? err.toString() : null,
      key: key
    });
  });

  dataCollector.on('done', function(errs, data) {
    console.dir({
      errorKeys: errs ? Object.keys(errs) : null,
      dataKeys: Object.keys(data)
    });
    console.log('Collector Error test done');
    end();
  });

  dataCollector.collect('user', new Error('User not found'));
  dataCollector.collect('file', 'file content');
  dataCollector.collect('score', 1000);
  dataCollector.collect('tcp', new Error('No socket'));

}

// Parallel execution

function parallelTest(end) {

  metasync.parallel([pf1, pf2, pf3], function done() {
    console.log('Parallel test done');
    end();
  });

  function pf1(data, callback) {
    console.log('pf1');
    setTimeout(function() {
      callback('result1');
    }, ASYNC_TIMEOUT);
  }

  function pf2(data, callback) {
    console.log('pf2');
    setTimeout(function() {
      callback('result2');
    }, ASYNC_TIMEOUT);
  }

  function pf3(data, callback) {
    console.log('pf3');
    setTimeout(function() {
      callback('result3');
    }, ASYNC_TIMEOUT);
  }

}

// Sequential execution

function sequentialTest(end) {

  metasync.sequential([sf1, sf2, sf3], function done() {
    console.log('Sequential test done');
    end();
  });

  function sf1(data, callback) {
    console.log('sf1');
    setTimeout(function() {
      callback('result1');
    }, ASYNC_TIMEOUT);
  }

  function sf2(data, callback) {
    console.log('sf2');
    setTimeout(function() {
      callback('result2');
    }, ASYNC_TIMEOUT);
  }

  function sf3(data, callback) {
    console.log('sf3');
    setTimeout(function() {
      callback('result3');
    }, ASYNC_TIMEOUT);
  }

}

// Asynchrous filter

function filterTest(end) {

  var dataToFilter = [
    'Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
    'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor',
    'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua',
  ];

  function filterPredicate(item, callback) {
    // filter words which consists of unique letters only
    var letters = [];
    var isUniqueLetters = false;
    console.log('checking value: ' + item);
    for (var i = 0; i < item.length; ++i) {
      if (letters.indexOf(item[i].toLowerCase()) > -1) {
        break;
      }
      letters.push(item[i].toLowerCase());
    }

    setTimeout(function() {
      callback(letters.length === item.length);
    }, ASYNC_TIMEOUT);
  }

  metasync.filter(dataToFilter, filterPredicate, function(result) {
    console.log('filtered array: ' + result);
    console.log('Filter test done');
    end();
  });

}

// Asynchrous find

function findTest(end) {

  metasync.find(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    function(item, callback) {
      callback(item % 3 === 0 && item % 5 === 0);
    },
    function(result) {
      console.log('found value: ' + result);
      console.log('Find test done');
      end();
    }
  );

}

// Asyncronous each in parallel

function eachTest(end) {

  metasync.each(
    ['a', 'b', 'c'],
    function iterator(item, callback) {
      console.dir({ each: item });
      callback();
    },
    function done(data) {
      console.log('Each test done');
      end();
    }
  );

}

// Asyncronous series (sequential)

function seriesTest(end) {

  metasync.series(
    ['a', 'b', 'c'],
    function iterator(item, callback) {
      console.dir({ series: item });
      callback();
    },
    function done(data) {
      console.log('Series test done');
      end();
    }
  );

}

// Asyncronous reduce (sequential)

function reduceTest(end) {

  metasync.reduce(
    ['a', 'b', 'c'],
    function performer(prev, curr, callback) {
      console.dir({ reduce: { prev: prev, curr: curr } });
      callback(null, curr);
    },
    function done(err, data) {
      console.log('Reduce test done');
      end();
    }
  );

}

function concurrentQueueTest(end) {

  var queue =  new metasync.ConcurrentQueue(3, 2000);

  queue.on('process', function(item, callback) {
    setTimeout(function() {
      console.dir({ item: item });
      callback();
    }, 100);
  });

  queue.on('timeout', function() {
    console.log('ConcurrentQueue timed out');
  });

  queue.on('empty', function() {
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

}

function throttleTest(end) {

  var state;

  function fn(letter) {
    console.log('Throttled function, state: ' + state);
    if (state === letter) {
      console.log('Throttle test done');
      end();
    }
  }

  var f1 = metasync.throttle(500, fn, ['I']);

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
  setTimeout(function() {
    state = 'F';
    f1();
  }, 600);
  setTimeout(function() {
    state = 'G';
    f1();
  }, 700);
  setTimeout(function() {
    state = 'H';
    f1();
  }, 1000);
  setTimeout(function() {
    state = 'I';
    f1();
  }, 1100);

}

function mapTest() {
  metasync.map([1, 2, 3], function(item, callback) {
    setTimeout(function() {
      callback(null, item * item);
    }, item * 10);
  }, function(error, result) {
    assert.ifError(error);
    assert.deepStrictEqual(result, [1, 4, 9]);
    console.log('Map test #1 done');
  });

  metasync.map([1, 2, 3], function(item, callback) {
    setTimeout(function() {
      if (item === 2) {
        callback(new Error());
      } else {
        callback(null, item);
      }
    }, item * 10);
  }, function(error, result) {
    assert.ok(error);
    assert.ifError(result);
    console.log('Map test #2 done');
  });
}

// Run tests

metasync.composition([
  compositionTest,
  collectorTest,
  collectorTimeoutTest,
  collectorErrorTest,
  parallelTest,
  sequentialTest,
  filterTest,
  findTest,
  eachTest,
  seriesTest,
  reduceTest,
  concurrentQueueTest,
  throttleTest,
  mapTest
], function allDone() {
  console.log('All tests done');
});
