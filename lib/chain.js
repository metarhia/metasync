'use strict';

module.exports = (api) => {

  const async = op => {
    switch (op) {
      case 'map': return api.metasync.map;
      case 'filter': return api.metasync.filter;
      case 'reduce': return api.metasync.reduce;
      case 'each': return api.metasync.each;
      case 'series': return api.metasync.series;
      case 'find': return api.metasync.find;
    }
  };

  function ArrayChain(array) {
    this.array = array;
    this.chain = [];
  }

  ArrayChain.prototype.execute = function(err) {
    const item = this.chain.shift() || {};

    if (!item.op) {
      if (err) throw err;
      else return;
    }

    const next = (err, data) => {
      this.array = data;
      this.execute(err);
    };

    if (item.op === 'fetch') {
      return item.fn(err, this.array, next);
    }

    if (err) return this.execute(err);

    const op = async(item.op);
    op(this.array, item.fn, next);
  };

  ArrayChain.prototype.fetch = function(fn) {
    this.chain.push({ op: 'fetch', fn });
    this.execute();
    return this;
  };

  ArrayChain.prototype.map = function(fn) {
    this.chain.push({ op: 'map', fn });
    return this;
  };

  ArrayChain.prototype.filter = function(fn) {
    this.chain.push({ op: 'filter', fn });
    return this;
  };

  ArrayChain.prototype.reduce = function(fn) {
    this.chain.push({ op: 'reduce', fn });
    return this;
  };

  ArrayChain.prototype.each = function(fn) {
    this.chain.push({ op: 'each', fn });
    return this;
  };

  ArrayChain.prototype.series = function(fn) {
    this.chain.push({ op: 'series', fn });
    return this;
  };

  ArrayChain.prototype.find = function(fn) {
    this.chain.push({ op: 'find', fn });
    return this;
  };

  api.metasync.for = (
    // Create an ArrayChain instance
    array // start mutations from this data
  ) => (
    new ArrayChain(array)
  );

};
