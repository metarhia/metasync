'use strict';

function ConcurrentQueue(
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
}

ConcurrentQueue.prototype.add = function(
  item // add item to queue
) {
  if (!this.isOnPause) {
    if (this.count < this.concurrency) this.next(item);
    else this.items.push(item);
  }
};

ConcurrentQueue.prototype.next = function(
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
  fn(item, (err, data) => {
    queue.emit('error', err, data);
    queue.count--;
    if (queue.timeout) clearTimeout(timer);
    if (queue.items.length > 0) {
      const item = queue.items.shift();
      queue.next(item);
    } else if (queue.count === 0) {
      queue.emit('empty');
    }
  });
};

ConcurrentQueue.prototype.on = function(
  // ConcurrentQueue events:
  eventName, // string
  listener // handler function
  // on('error', function(err))
  // on('empty', function()) - no more items in queue
  // on('process', function(item, callback)) - process item function
  // on('timeout', function(err, data))
) {
  if (!this.isOnPause && eventName in this.events) {
    this.events[eventName] = listener;
  }
};

ConcurrentQueue.prototype.emit = function(
  eventName, // event name
  err, // instance of Error
  data // attached data
) {
  if (!this.isOnPause) {
    const event = this.events[eventName];
    if (event) event(err, data);
  }
};

ConcurrentQueue.prototype.pause = function() {
  this.isOnPause = true;
};

ConcurrentQueue.prototype.resume = function() {
  this.isOnPause = false;
};

ConcurrentQueue.prototype.stop = function() {
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

module.exports = {
  ConcurrentQueue
};
