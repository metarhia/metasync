'use strict';

const QUEUE_TIMEOUT = 'Metasync: Queue timed out';

class Queue {
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

  wait(msec) {
    this.waitTimeout = msec;
    return this;
  }

  throttle(count, interval = 1000) {
    this.throttleCount = count;
    this.throttleInterval = interval;
    return this;
  }

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
  }

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

  pause() {
    this.paused = true;
    return this;
  }

  resume() {
    this.paused = false;
    return this;
  }

  clear() {
    this.count = 0;
    this.tasks = [];
    this.waiting = [];
    this.factors = {};
    return this;
  }

  timeout(msec, onTimeout = null) {
    this.processTimeout = msec;
    if (onTimeout) this.onTimeout = onTimeout;
    return this;
  }

  process(fn) {
    this.onProcess = fn;
    return this;
  }

  done(fn) {
    this.onDone = fn;
    return this;
  }

  success(listener) {
    this.onSuccess = listener;
    return this;
  }

  failure(listener) {
    this.onFailure = listener;
    return this;
  }

  drain(listener) {
    this.onDrain = listener;
    return this;
  }

  fifo() {
    this.fifoMode = true;
    return this;
  }

  lifo() {
    this.fifoMode = false;
    return this;
  }

  priority(flag = true) {
    this.priorityMode = flag;
    return this;
  }

  roundRobin(flag = true) {
    this.roundRobinMode = flag;
    return this;
  }

  pipe(dest) {
    if (dest instanceof Queue) {
      this.success((item) => void dest.add(item));
    }
    return this;
  }
}

const queue = (concurrency) => new Queue(concurrency);

module.exports = { queue, Queue };
