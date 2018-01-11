'use strict';

function Flow() {}

const flow = (
  // Create a composed function from flow syntax
  fns // array of functions, callback-last / err-first
  // Returns: function, composed callback-last / err-first
) => {
  const comp = function(data, callback) {
    comp.done = callback;
    if (comp.canceled) {
      if (callback) callback(new Error('Flow canceled'));
      return;
    }
    if (comp.timeout) {
      comp.timer = setTimeout(() => {
        comp.timer = null;
        if (callback) {
          callback(new Error('Flow timed out'));
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
    context: {},
    timeout: 0,
    timer: null,
    len: fns.length,
    canceled: false,
    paused: true,
    arrayed: false,
    done: null,
  };

  Object.setPrototypeOf(comp, Flow.prototype);
  return Object.assign(comp, fields);
};

Flow.prototype.exec = function(fn, finish) {
  if (Array.isArray(fn)) flow(fn)(this.context, finish);
  else fn(this.context, finish);
};

Flow.prototype.finalize = function(err) {
  if (this.timer) {
    clearTimeout(this.timer);
    this.timer = null;
  }
  if (this.done) {
    this.done(err, this.context);
    this.done = null;
  }
};

Flow.prototype.collect = function(err, result) {
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

Flow.prototype.parallel = function() {
  let counter = 0;
  const finish = (err, result) => {
    this.collect(err, result);
    if (++counter === this.len) this.finalize();
  };
  let i;
  for (i = 0; i < this.len; i++) {
    this.exec(this.fns[i], finish);
  }
};

Flow.prototype.sequential = function() {
  let next = null;
  let counter = -1;
  const finish = (err, result) => {
    this.collect(err, result);
    next();
  };
  next = () => {
    if (++counter === this.len) {
      this.finalize();
      return;
    }
    this.exec(this.fns[counter], finish);
  };
  next();
};

Flow.prototype.then = function(fulfill, reject) {
  this({}, (err, result) => {
    if (err) reject(err);
    else fulfill(result);
  });
  return this;
};

Flow.prototype.clone = function() {
  return flow(this.fns.slice());
};

Flow.prototype.pause = function() {
  if (!this.canceled) {
    this.paused = true;
  }
  return this;
};

Flow.prototype.resume = function() {
  if (!this.canceled) {
    this.paused = false;
  }
  return this;
};

Flow.prototype.timeout = function(msec) {
  this.timeout = msec;
  return this;
};

Flow.prototype.cancel = function() {
  if (!this.canceled && this.done) {
    this.done(new Error('Flow canceled'));
    this.done = null;
  }
  this.canceled = true;
  return this;
};

module.exports = {
  flow,
};
