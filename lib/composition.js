'use strict';

function Composition() {}

const compose = (
  // Asynchronous functions composition
  fns // array of functions, callback-last / err-first
  // Returns: function, composed callback-last / err-first
) => {
  const comp = function(data, callback) {
    if (!callback) {
      callback = data;
      data = {};
    }
    comp.done = callback;
    if (comp.canceled) {
      if (callback) callback(new Error('metasync canceled'));
      return;
    }
    if (comp.timeout) {
      comp.timer = setTimeout(() => {
        comp.timer = null;
        if (callback) {
          callback(new Error('metasync timed out'));
          comp.done = null;
        }
      }, comp.timeout);
    }
    comp.context = data;
    comp.arrayed = Array.isArray(comp.context);
    comp.paused = false;
    if (comp.len === 0) {
      comp.finalize();
      return;
    }
    if (comp.parallelize) comp.parallel();
    else comp.sequential();
  };

  const parallelize = fns.length === 1;
  if (parallelize) fns = fns[0];

  const fields = {
    fns,
    parallelize,
    context: null,
    timeout: 0,
    timer: null,
    len: fns.length,
    canceled: false,
    paused: true,
    arrayed: false,
    done: null,
  };

  Object.setPrototypeOf(comp, Composition.prototype);
  return Object.assign(comp, fields);
};

Composition.prototype.finalize = function(err) {
  if (this.timer) {
    clearTimeout(this.timer);
    this.timer = null;
  }
  if (this.done) {
    this.done(err, this.context);
    this.done = null;
  }
};

Composition.prototype.collect = function(err, result) {
  if (err) {
    if (this.done) this.done(err);
    this.done = null;
    return;
  }
  if (result !== this.context && result !== undefined) {
    if (this.arrayed) this.context.push(result);
    else if (typeof(result) === 'object') Object.assign(this.context, result);
  }
};

Composition.prototype.parallel = function() {
  let counter = 0;
  const next = (err, result) => {
    this.collect(err, result);
    if (++counter === this.len) this.finalize();
  };
  const fns = this.fns;
  const len = this.len;
  const context = this.context;
  let i, fn;
  for (i = 0; i < len; i++) {
    fn = fns[i];
    if (Array.isArray(fn)) compose(fn)(context, next);
    else fn(context, next);
  }
};

Composition.prototype.sequential = function() {
  let counter = -1;
  const fns = this.fns;
  const len = this.len;
  const context = this.context;
  const next = (err, result) => {
    if (err || result) this.collect(err, result);
    if (++counter === len) {
      this.finalize();
      return;
    }
    const fn = fns[counter];
    if (Array.isArray(fn)) compose(fn)(context, next);
    else fn(context, next);
  };
  next();
};

Composition.prototype.then = function(fulfill, reject) {
  this((err, result) => {
    if (err) reject(err);
    else fulfill(result);
  });
  return this;
};

Composition.prototype.clone = function() {
  return compose(this.fns.slice());
};

Composition.prototype.pause = function() {
  if (!this.canceled) {
    this.paused = true;
  }
  return this;
};

Composition.prototype.resume = function() {
  if (!this.canceled) {
    this.paused = false;
  }
  return this;
};

Composition.prototype.timeout = function(msec) {
  this.timeout = msec;
  return this;
};

Composition.prototype.cancel = function() {
  if (!this.canceled && this.done) {
    this.done(new Error('metasync canceled'));
    this.done = null;
  }
  this.canceled = true;
  return this;
};

module.exports = { compose };
