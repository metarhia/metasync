'use strict';

var metasync = require('./metasync');
var fs = require('fs');
var ASYNC_TIMEOUT = 200;

// Functional Asyncronous Composition

function compositionTest(data, end) {

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
      end('composition');
    }, ASYNC_TIMEOUT);
  }

}

// Data Collector

function collectorTest(data, end) {

  var dataCollector = new metasync.DataCollector(4, function(data) {
    console.dir(Object.keys(data));
    console.log('Collector test done');
    end('DataCollector');
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

// Parallel execution

function parallelTest(data, end) {

  metasync.parallel([pf1, pf2, pf3], function done() {
    console.log('Parallel test done');
    end('parallel');
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

function sequentialTest(data, end) {

  metasync.sequential([sf1, sf2, sf3], function done() {
    console.log('Sequential test done');
    end('sequential');
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

function filterTest(data, end) {

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
    end('filter');
  });

}

// Asynchrous find

function findTest(data, end) {

  metasync.find(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    function(item, callback) {
      callback(item % 3 === 0 && item % 5 === 0);
    },
    function(result) {
      console.log('found value: ' + result);
      console.log('Find test done');
      end('find');
    }
  );

}

// Asyncronous each in parallel

function eachTest(data, end) {

  metasync.each(
    ['a', 'b', 'c'],
    function iterator(item, callback) {
      console.dir({ each: item });
      callback();
    },
    function done(data) {
      console.log('Each test done');
      end('each');
    }
  );

}

// Asyncronous series (sequential)

function seriesTest(data, end) {

  metasync.series(
    ['a', 'b', 'c'],
    function iterator(item, callback) {
      console.dir({ series: item });
      callback();
    },
    function done(data) {
      console.log('Series test done');
      end('series')
    }
  );

}

// Run tests

metasync.composition([
  compositionTest,
  collectorTest,
  parallelTest,
  sequentialTest,
  filterTest,
  findTest,
  eachTest,
  seriesTest,
  function allDone() {
    console.log('All tests done');
  }
]);
