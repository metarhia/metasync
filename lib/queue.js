'use strict';

function Queue(
  concurrency // number, asynchronous concurrency
) {
  this.paused = false;
  this.concurrency = concurrency;
  this.waitTimeout = 0;
  this.processTimeout = 0;
  this.throttleCount = 0;
  this.throttleInterval = 1000;
  this.count = 0;
  this.tasks = [];
  this.waiting = [];
  this.factors = {};
  this.fifoMode = true;
  this.roundRobinMode = false;
  this.priorityMode = false;
  this.onProcess = null;
  this.onDone = null;
  this.onSuccess = null;
  this.onTimeout = null;
  this.onFailure = null;
  this.onDrain = null;
}

const QUEUE_TIMEOUT = 'Metasync: Queue timed out';

Queue.prototype.wait = function(
  // Set wait before processing timeout
  msec // number, wait timeout for single item
) {
  this.waitTimeout = msec;
  return this;
};

Queue.prototype.throttle = function(
  // Throttle to limit throughput
  count, // number, item count
  interval = 1000 // number (optional), per interval, default: 1000 msec
) {
  this.throttleCount = count;
  this.throttleInterval = interval;
  return this;
};

Queue.prototype.add = function(
  // Add item to queue
  item, // object, to be added
  factor = 0, // number or string (optional), type, source, destination or path
  priority = 0 // number (optional)
) {
  if (this.priorityMode && !this.roundRobinMode) {
    priority = factor;
    factor = 0;
  }
  const task = [item, factor, priority];
  const slot = this.count < this.concurrency;
  if (!this.paused && slot && this.onProcess) {
    this.next(task);
    return this;
  }
  let tasks;
  if (this.roundRobinMode) {
    tasks = this.factors[factor];
    if (!tasks) {
      tasks = [];
      this.factors[factor] = tasks;
      this.waiting.push(tasks);
    }
  } else {
    tasks = this.tasks;
  }

  if (this.fifoMode) tasks.push(task);
  else tasks.unshift(task);

  if (this.priorityMode) {
    if (this.fifoMode) {
      tasks.sort((a, b) => b[2] - a[2]);
    } else {
      tasks.sort((a, b) => a[2] - b[2]);
    }
  }
  return this;
};

Queue.prototype.next = function(
  // Process next item
  task // array, next task [item, factor, priority]
) {
  const item = task[0];
  let timer;
  this.count++;
  if (this.processTimeout) {
    timer = setTimeout(() => {
      const err = new Error(QUEUE_TIMEOUT);
      if (this.onTimeout) this.onTimeout(err);
    }, this.processTimeout);
  }
  this.onProcess(item, (err, result) => {
    if (this.onDone) this.onDone(err, result);
    if (err) {
      if (this.onFailure) this.onFailure(err);
    } else if (this.onSuccess) {
      this.onSuccess(result);
    }
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    this.count--;
    if (this.tasks.length > 0 || this.waiting.length > 0) {
      this.takeNext();
    } else if (this.count === 0 && this.onDrain) {
      this.onDrain();
    }
  });
  return this;
};

Queue.prototype.takeNext = function(
  // Prepare next item for processing
) {
  if (this.paused || !this.onProcess) {
    return this;
  }
  let tasks;
  if (this.roundRobinMode) {
    tasks = this.waiting.shift();
    if (tasks.length > 1) {
      this.waiting.push(tasks);
    }
  } else {
    tasks = this.tasks;
  }
  const task = tasks.shift();
  if (task) this.next(task);
  return this;
};

Queue.prototype.pause = function(
  // Pause queue
) {
  this.paused = true;
  // stub
  return this;
};

Queue.prototype.resume = function(
  // Resume queue
) {
  this.paused = false;
  // stub
  return this;
};

Queue.prototype.clear = function(
  // Clear queue
) {
  this.count = 0;
  this.tasks = [];
  this.waiting = [];
  this.factors = {};
  return this;
};

Queue.prototype.timeout = function(
  // Set timeout interval and listener
  msec, // number, process timeout for single item
  onTimeout = null // function, (item) => {}
) {
  this.processTimeout = msec;
  if (onTimeout) this.onTimeout = onTimeout;
  return this;
};

Queue.prototype.process = function(
  // Set processing function
  fn // function, processing (item, callback)
) {
  this.onProcess = fn;
  return this;
};

Queue.prototype.done = function(
  // Set listener on processing done
  fn // function, done listener (err, result)
) {
  this.onDone = fn;
  return this;
};

Queue.prototype.success = function(
  // Set listener on processing success
  listener // function, on success (item) => {}
) {
  this.onSuccess = listener;
  return this;
};

Queue.prototype.failure = function(
  // Set listener on processing error
  listener // function, on failure (err, item) => {}
) {
  this.onFailure = listener;
  return this;
};

Queue.prototype.drain = function(
  // Set listener on drain Queue
  listener // function, on drain () => {}
) {
  this.onDrain = listener;
  return this;
};

Queue.prototype.fifo = function(
  // Switch FIFO mode (default for Queue)
) {
  this.fifoMode = true;
  return this;
};

Queue.prototype.lifo = function(
  // Switch LIFO mode
) {
  this.fifoMode = false;
  return this;
};

Queue.prototype.priority = function(
  // Activate or deactivate priority mode
  flag = true // boolean, default: true, use false to disable priority mode
) {
  this.priorityMode = flag;
  return this;
};

Queue.prototype.roundRobin = function(
  // Activate or deactivate round robin mode
  flag = true // boolean, default: true, use false to disable roundRobin mode
) {
  this.roundRobinMode = flag;
  return this;
};

Queue.prototype.pipe = function(
  // Pipe processed items to different queue
  dest // Queue, destination queue
) {
  if (dest instanceof Queue) {
    this.success(item => {
      dest.add(item);
    });
  }
  return this;
};

// Queue instantiation
//   concurrency - number, of simultaneous and asynchronously executing tasks
// Returns: Queue, instance
const queue = concurrency => new Queue(concurrency);

module.exports = { queue };
