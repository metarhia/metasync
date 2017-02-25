'use strict';

const metasync = {};
module.exports = metasync;

metasync.ConcurrentQueue = function(
  // ConcurrentQueue
  concurrency, // number of simultaneous and asynchronously executing tasks
  timeout // process timeout (optional), for single item
) {
  this.isOnPause = false;
  this.concurrency = concurrency;
  this.timeout = timeout;
  this.count = 0;
  this.items = [];
  this.events = {
    error: null,
    timeout: null,
    empty: null,
    process: null
  };
};

metasync.ConcurrentQueue.prototype.add = function(
  item // add item to queue
) {
  if (!this.isOnPause) {
    if (this.count < this.concurrency) {
      this.next(item);
    } else {
      this.items.push(item);
    }
  }
};

metasync.ConcurrentQueue.prototype.next = function(
  item // process next item from queue
) {
  const queue = this;
  let timer;
  if (queue.isOnPause) return;
  queue.count++;
  if (queue.timeout) {
    timer = setTimeout(() => {
      const err = new Error('ConcurrentQueue timed out');
      queue.emit('timeout', err);
    }, queue.timeout);
  }
  const stub = (item, callback) => callback();
  const fn = queue.events.process || stub;
  fn(item, () => {
    queue.count--;
    if (queue.timeout) {
      clearTimeout(timer);
    }
    if (queue.items.length > 0) {
      const item = queue.items.shift();
      queue.next(item);
    } else if (queue.count === 0) {
      queue.emit('empty');
    }
  });
};

metasync.ConcurrentQueue.prototype.on = function(
  // ConcurrentQueue events:
  eventName,
  fn
  // on('error', function(err))
  // on('empty', function()) - no more items in queue
  // on('process', function(item, callback)) - process item function
  // on('timeout', function(err, data))
) {
  if (!this.isOnPause && eventName in this.events) {
    this.events[eventName] = fn;
  }
};

metasync.ConcurrentQueue.prototype.emit = function(
  eventName, // event name
  err, // instance of Error
  data // attached data
) {
  if (!this.isOnPause) {
    const event = this.events[eventName];
    if (event) event(err, data);
  }
};

metasync.ConcurrentQueue.prototype.pause = function() {
  this.isOnPause = true;
};

metasync.ConcurrentQueue.prototype.resume = function() {
  this.isOnPause = false;
};

metasync.ConcurrentQueue.prototype.stop = function() {
  this.isOnPause = false;
  this.concurrency = null;
  this.timeout = null;
  this.count = 0;
  this.items = [];
  this.events = {
    error: null,
    timeout: null,
    empty: null,
    process: null
  };
};
