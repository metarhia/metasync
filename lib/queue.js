'use strict';

const QUEUE_TIMEOUT = 'Metasync: Queue timed out';

class Queue {
  // Queue constructor
  //   concurrency - <number>, asynchronous concurrency
  constructor(concurrency) {
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
    this.roundRobinMode = false;
    this.priorityMode = false;
    this.onProcess = null;
    this.onDone = null;
    this.onSuccess = null;
    this.onTimeout = null;
    this.onFailure = null;
    this.onDrain = null;
  }

  // Set wait before processing timeout
  //   msec - <number>, wait timeout for single item
  //
  // Returns: <this>
  wait(msec) {
    this.waitTimeout = msec;
    return this;
  }

  // Throttle to limit throughput
  //   count - <number>, item count
  //   interval - <number>, per interval, optional
  //       default: 1000 msec
  //
  // Returns: <this>
  throttle(count, interval = 1000) {
    this.throttleCount = count;
    this.throttleInterval = interval;
    return this;
  }

  // Add item to queue
  //   item - <Object>, to be added
  //   factor - <number> | <string>, type, source,
  //       destination or path, optional
  //   priority - <number>, optional
  //
  // Returns: <this>
  add(item, factor = 0, priority = 0) {
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

    tasks.push(task);

    if (this.priorityMode) {
      tasks.sort((a, b) => b[2] - a[2]);
    }
    return this;
  }

  // Process next item
  //   task - <Array>, next task [item, factor, priority]
  //
  // Returns: <this>
  next(task) {
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
  }

  // Prepare next item for processing
  //
  // Returns: <this>
  takeNext() {
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
  }

  // Pause queue
  // This function is not completely implemented yet
  //
  // Returns: <this>
  pause() {
    this.paused = true;
    return this;
  }

  // Resume queue
  // This function is not completely implemented yet
  //
  // Returns: <this>
  resume() {
    this.paused = false;
    return this;
  }

  // Clear queue
  //
  // Returns: <this>
  clear() {
    this.count = 0;
    this.tasks = [];
    this.waiting = [];
    this.factors = {};
    return this;
  }

  // Set timeout interval and listener
  //   msec - <number>, process timeout for single item
  //   onTimeout - <Function>
  //
  // Returns: <this>
  timeout(msec, onTimeout = null) {
    this.processTimeout = msec;
    if (onTimeout) this.onTimeout = onTimeout;
    return this;
  }

  // Set processing function
  //   fn - <Function>
  //     item - <Object>
  //     callback - <Function>
  //       err - <Error> | <null>
  //       result - <any>
  //
  // Returns: <this>
  process(fn) {
    this.onProcess = fn;
    return this;
  }

  // Set listener on processing done
  //   fn - <Function>, done listener
  //     err - <Error> | <null>
  //     result - <any>
  //
  // Returns: <this>
  done(fn) {
    this.onDone = fn;
    return this;
  }

  // Set listener on processing success
  //   listener - <Function>, on success
  //     item - <any>
  //
  // Returns: <this>
  success(listener) {
    this.onSuccess = listener;
    return this;
  }

  // Set listener on processing error
  //   listener - <Function>, on failure
  //     err - <Error> | <null>
  //
  // Returns: <this>
  failure(listener) {
    this.onFailure = listener;
    return this;
  }

  // Set listener on drain Queue
  //   listener - <Function>, on drain
  //
  // Returns: <this>
  drain(listener) {
    this.onDrain = listener;
    return this;
  }

  // Activate or deactivate priority mode
  //   flag - <boolean>, default: true, false will
  //       disable priority mode
  //
  // Returns: <this>
  priority(flag = true) {
    this.priorityMode = flag;
    return this;
  }

  // Activate or deactivate round robin mode
  //   flag - <boolean>, default: true, false will
  //       disable roundRobin mode
  //
  // Returns: <this>
  roundRobin(flag = true) {
    this.roundRobinMode = flag;
    return this;
  }

  // Pipe processed items to different queue
  //   dest - <Queue>, destination queue
  //
  // Returns: <this>
  pipe(dest) {
    if (dest instanceof Queue) {
      this.success(item => {
        dest.add(item);
      });
    }
    return this;
  }
}

// Queue instantiation
//   concurrency - <number>, simultaneous and
//       asynchronously executing tasks
//
// Returns: <Queue>
const queue = concurrency => new Queue(concurrency);

module.exports = { queue };
