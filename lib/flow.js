'use strict';

const util = require('util');
const common = require('metarhia-common');

function Flow() {
}

util.inherits(Flow, Function);

const flow = (
  // Create a composed function from flow syntax
  fns // array of functions, callback-last / err-first
  // Returns: function, composed callback-last / err-first
) => {
  const comp = (data, callback) => {
    comp.done = common.once(callback);
    if (comp.timeout) {
      comp.timer = setTimeout(() => {
        comp.timer = null;
        comp.done(new Error('Flow timed out'));
      }, comp.timeout);
    }
    if (comp.canceled) {
      comp.done(new Error('Flow canceled'));
      return;
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
    context: {},
    timeout: 0,
    timer: null,
    len: fns.length,
    canceled: false,
    paused: true,
    arrayed: false,
    done: common.emptiness,
  };

  Object.setPrototypeOf(comp, Flow.prototype);
  return Object.assign(comp, fields);
};

Flow.prototype.exec = function(fn, finish) {
  if (Array.isArray(fn)) flow(fn)(this.context, finish);
  else if (fn.length === 2) fn(this.context, finish);
  else fn(finish);
};

Flow.prototype.finalize = function(err) {
  if (this.timer) {
    clearTimeout(this.timer);
    this.timer = null;
  }
  this.done(err, this.context);
};

Flow.prototype.collect = function(err, result) {
  if (err) {
    this.done(err);
    return;
  }
  if (result !== this.context && result !== undefined) {
    if (this.arrayed) this.context.push(result);
    else if (typeof(result) === 'object') Object.assign(this.context, result);
  }
};

Flow.prototype.parallel = function() {
  let counter = 0;
  const finish = (fn, err, result) => {
    this.collect(err, result);
    if (++counter === this.len) this.finalize();
  };
  let i, fn;
  for (i = 0; i < this.len; i++) {
    fn = this.fns[i];
    this.exec(fn, finish.bind(null, fn));
  }
};

Flow.prototype.sequential = function() {
  let next = null;
  let i = -1;
  const finish = (err, result) => {
    this.collect(err, result);
    next();
  };
  next = () => {
    if (++i === this.len) {
      this.finalize();
      return;
    }
    const fn = this.fns[i];
    this.exec(fn, finish);
  };
  next();
};

Flow.prototype.then = function(fulfilled, rejected) {
  const fulfill = common.once(fulfilled);
  const reject = common.once(rejected);
  this({}, (err, result) => {
    if (err) reject(err);
    else fulfill(result);
  });
  return this;
};

Flow.prototype.clone = function() {
  const cloned = flow(this.fns.slice());
  return cloned;
};

Flow.prototype.pause = function() {
  this.paused = true;
  return this;
};

Flow.prototype.resume = function() {
  this.paused = false;
  return this;
};

Flow.prototype.timeout = function(msec) {
  this.timeout = msec;
  return this;
};

Flow.prototype.cancel = function() {
  if (!this.canceled) this.done(new Error('Flow canceled'));
  this.canceled = true;
  return this;
};

module.exports = {
  flow,
};
