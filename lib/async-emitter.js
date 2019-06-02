'use strict';

class AsyncEmitter {
  constructor() {
    this.events = new Map();
  }

  // Get or create event
  //   name <string> event name
  // Returns: { on: <Set>, once: <Set> } }
  event(name) {
    const { events } = this;
    const event = events.get(name);
    if (event) return event;
    const res = { on: new Set(), once: new Set() };
    events.set(name, res);
    return res;
  }

  // Add listener
  //   name <string> event name
  //   fn <Function> listener
  on(name, fn) {
    this.event(name).on.add(fn);
  }

  // Add listener
  //   name <string> event name
  //   fn <Function> listener
  // Returns: <Promise> | <null>
  once(name, fn) {
    if (fn === undefined) {
      return new Promise(resolve => {
        this.once(name, resolve);
      });
    }
    this.event(name).once.add(fn);
    return null;
  }

  // Emit event
  //   name <string> event name
  //   args <any[]>
  // Returns: <Promise> | <null>
  emit(name, ...args) {
    const { events } = this;
    const event = events.get(name);
    if (!event) return null;
    const { on, once } = event;
    const promises = [...on.values(), ...once.values()].map(fn => fn(...args));
    once.clear();
    if (on.size === 0) events.delete(name);
    return Promise.all(promises);
  }

  // Remove event listener
  //   name <string> event name
  //   fn <Function> listener to remove
  remove(name, fn) {
    const { events } = this;
    const event = events.get(name);
    if (!event) return;
    const { on, once } = event;
    on.delete(fn);
    once.delete(fn);
    if (on.size === 0 && once.size === 0) {
      events.delete(name);
    }
  }

  // Remove all listeners or by name
  //   name <string> event name
  clear(name) {
    const { events } = this;
    if (!name) events.clear();
    else events.delete(name);
  }

  // Get listeners count by event name
  //   name <string> event name
  // Returns: <number>
  count(name) {
    const event = this.events.get(name);
    if (!event) return 0;
    const { on, once } = event;
    return on.size + once.size;
  }

  // Get listeners array by event name
  //   name <string> event name
  // Returns: <Function[]>
  listeners(name) {
    const event = this.events.get(name);
    if (!event) return [];
    const { on, once } = event;
    return [...on.values(), ...once.values()];
  }

  // Get event names array
  // Returns: <string[]> names
  names() {
    return [...this.events.keys()];
  }
}

module.exports = { AsyncEmitter };
