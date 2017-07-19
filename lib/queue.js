'use strict';

function ConcurrentQueue(
  // ConcurrentQueue
  concurrency // number of simultaneous and asynchronously executing tasks
) {
  this.paused = false;
  this.concurrency = concurrency;
  this.waitTimeout = 0;
  this.processTimeout = 0;
  this.throttleCount = 0;
  this.throttleInterval = 1000;
  this.count = 0;
  this.items = [];
  this.onProcess = null;
  this.onSuccess = null;
  this.onTimeout = null;
  this.onFailure = null;
  this.onDrain = null;
}


ConcurrentQueue.prototype.wait = function(
  msec // wait timeout for single item
) {
  this.waitTimeout = msec;
  return this;
};

ConcurrentQueue.prototype.throttle = function(
  count, // item count
  interval = 1000 // per interval (optional, default: 1000 msec)
) {
  this.throttleCount = count;
  this.throttleInterval = interval;
  return this;
};

ConcurrentQueue.prototype.add = function(
  item // add item to queue
) {
  if (!this.paused) {
    if (this.count < this.concurrency) this.next(item);
    else this.items.push(item);
  }
  return this;
};

ConcurrentQueue.prototype.next = function(
  item // process next item from queue
) {
  const fn = this.onProcess;
  if (this.paused || !fn) return this;
  let timer;
  this.count++;
  if (this.processTimeout) {
    timer = setTimeout(() => {
      const err = new Error('Queue timed out');
      if (this.onTimeout) this.onTimeout(err);
    }, this.processTimeout);
  }
  fn(item, (err, data) => {
    if (this.onFailure) this.onFailure(err, data);
    this.count--;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (this.items.length > 0) {
      const item = this.items.shift();
      this.next(item);
    } else if (this.count === 0) {
      if (this.onDrain) this.onDrain();
    }
  });
  return this;
};

ConcurrentQueue.prototype.pause = function() {
  this.paused = true;
  return this;
};

ConcurrentQueue.prototype.resume = function() {
  this.paused = false;
  return this;
};

ConcurrentQueue.prototype.stop = function() {
  this.paused = true;
  this.count = 0;
  this.items = [];
  return this;
};

ConcurrentQueue.prototype.timeout = function(
  msec, // process timeout for single item
  onTimeout = null // function (item) => {}
) {
  this.processTimeout = msec;
  this.onTimeout = onTimeout;
  return this;
};

ConcurrentQueue.prototype.process = function(
  fn // processing function (item, callback)
) {
  this.onProcess = fn;
  return this;
};

ConcurrentQueue.prototype.success = function(
  listener // on success (item) => {}
) {
  this.onSuccess = listener;
  return this;
};

ConcurrentQueue.prototype.failure = function(
  listener // on failure (err, item) => {}
) {
  this.onFailure = listener;
  return this;
};

ConcurrentQueue.prototype.drain = function(
  listener //  on drain () => {}
) {
  this.onDrain = listener;
  return this;
};

const queue = (
  // ConcurrentQueue
  concurrency // number of simultaneous and asynchronously executing tasks
) => new ConcurrentQueue(concurrency);

module.exports = {
  queue
};
