'use strict';

const { EventEmitter } = require('events');
const { Worker, isMainThread, parentPort } = require('worker_threads');

const threads = new Set();

const LOCKED = 0;
const UNLOCKED = 1;

const sendMessage = message => {
  if (isMainThread) {
    for (const thread of threads) {
      thread.worker.postMessage(message);
    }
  } else {
    parentPort.postMessage(message);
  }
};

class Lock {
  constructor(name, mode = 'exclusive', buffer = null) {
    this.name = name;
    this.mode = mode; // 'exclusive' or 'shared'
    this.queue = [];
    this.owner = false;
    this.trying = false;
    const initial = !buffer;
    this.buffer = initial ? new SharedArrayBuffer(4) : buffer;
    this.flag = new Int32Array(this.buffer, 0, 1);
    if (initial) Atomics.store(this.flag, 0, UNLOCKED);
  }

  enter(lock) {
    this.queue.push(lock);
    this.trying = true;
    return this.tryEnter();
  }

  tryEnter() {
    if (this.queue.length === 0) return undefined;
    const prev = Atomics.exchange(this.flag, 0, LOCKED);
    if (prev === LOCKED) return undefined;
    this.owner = true;
    this.trying = false;
    const lock = this.queue.shift();
    return lock.callback(lock).then(() => {
      this.leave();
    });
  }

  leave() {
    if (!this.owner) return;
    Atomics.store(this.flag, 0, UNLOCKED);
    this.owner = false;
    sendMessage({ kind: 'leave', name: this.name });
    this.tryEnter();
  }
}

class LockManagerSnapshot {
  constructor(resources) {
    const held = [];
    const pending = [];
    this.held = held;
    this.pending = pending;

    for (const lock of resources) {
      if (lock.queue.length > 0) {
        pending.push(...lock.queue);
      }
      if (lock.owner) {
        held.push(lock);
      }
    }
  }
}

class LockManager {
  constructor() {
    this.collection = new Map();
  }

  async request(name, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    const { mode = 'exclusive', signal = null } = options;

    let lock = this.collection.get(name);
    if (lock) {
      if (mode === 'exclusive') {
        return new Promise(resolve => {
          lock.queue.push([callback, resolve]);
        });
      }
    } else {
      lock = new Lock(name, mode);
      this.collection.set(name, lock);
      const { buffer } = lock;
      sendMessage({ kind: 'create', name, mode, buffer });
    }

    const finished = callback(lock);
    let aborted = null;
    if (signal) {
      aborted = new Promise((resolve, reject) => {
        signal.on('abort', reject);
      });
      await Promise.race([finished, aborted]);
    } else {
      await finished;
    }

    let next = lock.queue.pop();
    while (next) {
      const [handler, resolve] = next;
      await handler(lock);
      resolve();
      next = lock.queue.pop();
    }
    this.collection.delete(name);
    return undefined;
  }

  query() {
    const snapshot = new LockManagerSnapshot();
    return Promise.resolve(snapshot);
  }
}

class AbortError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AbortError';
  }
}

class AbortSignal extends EventEmitter {
  constructor() {
    super();
    this.aborted = false;
    this.on('abort', () => {
      this.aborted = true;
    });
  }
}

class AbortController {
  constructor() {
    this.signal = new AbortSignal();
  }

  abort() {
    const error = new AbortError('The request was aborted');
    this.signal.emit('abort', error);
  }
}

const locks = new LockManager();

const receiveMessage = message => {
  const { kind, name, mode, buffer } = message;
  if (kind === 'create') {
    const lock = new Lock(name, mode, buffer);
    locks.collection.set(name, lock);
  } else if (kind === 'leave') {
    for (const lock of locks.collection) {
      if (lock.name === name && lock.trying) {
        lock.tryEnter();
      }
    }
  }
};

if (!isMainThread) {
  parentPort.on('message', receiveMessage);
}

class Thread {
  constructor(filename, options) {
    const worker = new Worker(filename, options);
    this.worker = worker;
    threads.add(this);
    worker.on('message', message => {
      for (const thread of threads) {
        if (thread.worker !== worker) {
          thread.worker.postMessage(message);
        }
      }
      receiveMessage(message);
    });
  }
}

module.exports = { locks, Thread, AbortController };
