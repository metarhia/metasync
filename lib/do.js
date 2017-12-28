'use strict';

function Do() {}

const chain = function(fn, ...args) {
  const current = (done) => {
    if (done) current.done = done;
    if (current.prev) {
      current.prev.next = current;
      current.prev();
    } else {
      current.forward();
    }
    return current;
  };

  const prev = this instanceof Do ? this : null;
  const fields = { prev, fn, args, done: null };

  Object.setPrototypeOf(current, Do.prototype);
  return Object.assign(current, fields);
};

Do.prototype.do = function(fn, ...args) {
  return chain.call(this, fn, ...args);
};

Do.prototype.forward = function() {
  if (this.fn) this.fn(...this.args, (err, data) => {
    const next = this.next;
    if (next) {
      if (next.fn) next.forward();
    } else if (this.done) {
      this.done(err, data);
    }
  });
};

module.exports = {
  do: chain,
};
