'use strict';

var DataCollector = function(expected, done) {
  this.expected = expected;
  this.data = {};
  this.count = 0;
  this.done = done;
};

DataCollector.prototype.collect = function(key, data) {
  this.count++;
  this.data[key] = data;;
  if (this.expected === this.count) this.done(this.data);
};

module.exports = {
  DataCollector: DataCollector
};
