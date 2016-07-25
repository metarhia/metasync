'use strict';

var metasync = require('./metasync');
var fs = require('fs');

// Data Collector

var dataCollector = new metasync.DataCollector(4, function(data) {
  console.dir(Object.keys(data));
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
}, 1000);

// Functional Asyncronous Composition

metasync.composition(
  [f1,f2,f3,[[f4,f5,[f6,f7],f8]],f9],
  function done(data) {
    console.log('done');
  }
);

function f1(callback) {
  console.log('f1');
  setTimeout(function() {
    callback();
  }, 1000);
}

function f2(callback) {
  console.log('f2');
  setTimeout(function() {
    callback();
  }, 1000);
}

function f3(callback) {
  console.log('f3');
  setTimeout(function() {
    callback();
  }, 1000);
}

function f4(callback) {
  console.log('f4');
  setTimeout(function() {
    callback();
  }, 1000);
}

function f5(callback) {
  console.log('f5');
  setTimeout(function() {
    callback();
  }, 1000);
}

function f6(callback) {
  console.log('f6');
  setTimeout(function() {
    callback();
  }, 1000);
}

function f7(callback) {
  console.log('f7');
  setTimeout(function() {
    callback();
  }, 1000);
}

function f8(callback) {
  console.log('f8');
  setTimeout(function() {
    callback();
  }, 1000);
}

function f9(callback) {
  console.log('f9');
  setTimeout(function() {
    callback();
  }, 1000);
}


// Asynchrous filter

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
  }, 1000);
}

metasync.filter(dataToFilter, filterPredicate, function(result) {
  console.log('filtered array: ' + result);
});

metasync.find(
  function(item) {
    return item % 3 === 0 && item % 5 === 0;
  },
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  function(result) {
    console.log('found value is: ' + result);
  }
);
