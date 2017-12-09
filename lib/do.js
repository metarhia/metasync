'use strict';

const util = require('util');

function Chain() {
}

util.inherits(Chain, Function);

const chain = (prev = null) => {

  const current = (done) => {
    if (done) current.done = done;
    if (current.prev) {
      current.prev.next = current;
      current.prev();
    } else {
      current.forward();
    }
  };

  const fields = { prev, fn: null, args: null, done: null };

  Object.setPrototypeOf(current, Chain.prototype);
  return Object.assign(current, fields);
};

Chain.prototype.do = function(fn, ...args) {
  this.fn = fn;
  this.args = args;
  return chain(this);
};

Chain.prototype.forward = function() {
  if (this.fn) this.fn(...this.args, (err, data) => {
    if (this.next && this.next.fn) {
      this.next.forward();
    } else if (this.next.done) {
      this.next.done(err, data);
    }
  });
};

module.exports = {
  chain,
};
