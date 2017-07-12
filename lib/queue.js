'use strict';

module.exports = (api) => {

  api.metasync.queue = (concurrency) => {
    let active = true;
    let count = 0;
    let wait = 0;
    let timeout = 0;
    const input = [];
    const throttles = [];
    let process = api.common.emptiness;
    let output = api.common.emptiness;
    let drain = api.common.emptiness;

    const queue = (item) => {
      if (active && count < concurrency) queue.next(item);
      else input.push(item);
      let timer;
      if (wait) {
        timer = setTimeout(() => {
          output(new Error('Queue wait timeout'));
        }, wait);
        timer.unref();
      }
    };

    queue.wait = (msec) => (wait = msec, queue);
    queue.timeout = (msec) => (timeout = msec, queue);
    queue.throttle = (rq, msec) => (throttles.push([rq, msec]), queue);
    queue.process = (fn) => (process = fn, queue);
    queue.output = (fn) => (output = fn, queue);
    queue.drain = (fn) => (drain = fn, queue);
    queue.pause = () => (active = false, queue);
    queue.resume = () => (active = true, queue.next(), queue);

    queue.next = (item) => {
      let timer;
      if (!active) return; // maybe remove
      count++;
      if (timeout) {
        timer = setTimeout(() => {
          output(new Error('Queue process timeout'));
        }, timeout);
      }
      process(item, (err, data) => {
        count--;
        output(err, data);
        if (timer) clearTimeout(timer);
        if (input.length > 0) {
          const item = input.shift();
          queue.next(item);
        } else if (queue.count === 0) {
          drain();
        }
      });
    };

    return queue;
  };

  api.metasync.ConcurrentQueue = function(
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

  api.metasync.ConcurrentQueue.prototype.add = function(
    item // add item to queue
  ) {
    if (!this.isOnPause) {
      if (this.count < this.concurrency) this.next(item);
      else this.items.push(item);
    }
  };

  api.metasync.ConcurrentQueue.prototype.next = function(
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

  api.metasync.ConcurrentQueue.prototype.on = function(
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

  api.metasync.ConcurrentQueue.prototype.emit = function(
    eventName, // event name
    err, // instance of Error
    data // attached data
  ) {
    if (!this.isOnPause) {
      const event = this.events[eventName];
      if (event) event(err, data);
    }
  };

  api.metasync.ConcurrentQueue.prototype.pause = function() {
    this.isOnPause = true;
  };

  api.metasync.ConcurrentQueue.prototype.resume = function() {
    this.isOnPause = false;
  };

  api.metasync.ConcurrentQueue.prototype.stop = function() {
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

};
