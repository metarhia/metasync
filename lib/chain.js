'use strict';

const { map, filter, reduce, each, series, find } = require('./array');

const async = op => {
  switch (op) {
    case 'map': return map;
    case 'filter': return filter;
    case 'reduce': return reduce;
    case 'each': return each;
    case 'series': return series;
    case 'find': return find;
  }
  return (items, fn, callback) => {
    callback(null, items.slice());
  };
};

function ArrayChain(array) {
  this.array = array;
  this.chain = [];
}

ArrayChain.prototype.execute = function(err) {
  const item = this.chain.shift() || {};

  if (!item.op) {
    if (err) throw err;
    else return null;
  }

  const next = (err, data) => {
    this.array = data;
    this.execute(err);
  };

  if (item.op === 'fetch') {
    return item.fn(err, this.array, next);
  }

  if (err) {
    this.execute(err);
    return null;
  }

  if (item.isSync) {
    this.array = item.fn();
    this.execute(null);
  } else {
    const op = async(item.op);
    op(this.array, item.fn, next);
  }

  return null;
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

const syncDelegates = {
  returns: {
    opNames: ['concat', 'slice', 'includes'],
    handler(op, ...args) {
      return this.array[op](...args);
    },
  },
  modify: {
    opNames: ['reverse', 'sort', 'shift', 'unshift', 'push', 'pop'],
    handler(op, ...args) {
      this.array[op](...args);
      return this.array;
    },
  },
};

for (const delegateType in syncDelegates) {
  const { opNames, handler } = syncDelegates[delegateType];
  for (const op of opNames) {
    ArrayChain.prototype[op] = function(...args) {
      const fn = handler.bind(this, op, ...args);
      this.chain.push({ op, fn, isSync: true });
      return this;
    };
  }
}

// Create an ArrayChain instance
//   array - array, start mutations from this data
// Returns: ArrayChain instance
const forArrayChain = array => new ArrayChain(array);

module.exports = { for: forArrayChain };
