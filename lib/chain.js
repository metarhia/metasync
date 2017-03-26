'use strict';

module.exports = (api) => {

  let id = 0;

  class ArrayChain {

    constructor(array, prev = null) {
      this.id = id++;
      this.prev = prev;
      this.next = null;
      this.array = array;
      if (!prev) process.nextTick(() => this.do(null, array));
    }

    then(done) {
      this.done = done;
      return this;
    }

    catch(fail) {
      this.fail = fail;
      return this;
    }

    do(err, data) {
      this.array = data;
      if (this.next) this.next();
      if (err) {
        if (this.fail) this.fail(err);
      } else if (this.done) {
        this.done(data);
      }
    }

    chain() {
      return new ArrayChain([], this);
    }

    map(fn) {
      const chain = this.chain();
      const finish = (err, data) => chain.do(err, data);
      this.next = () => api.metasync.map(this.array, fn, finish);
      return chain;
    }

    filter(fn) {
      const chain = this.chain();
      const finish = (data) => chain.do(null, data);
      this.next = () => api.metasync.filter(this.array, fn, finish);
      return chain;
    }

    reduce(fn, initial) {
      const chain = this.chain();
      const finish = (err, data) => chain.do(err, data);
      this.next = () => api.metasync.reduce(this.array, fn, finish, initial);
      return chain;
    }

    each(fn) {
      const chain = this.chain();
      const finish = (err, data) => chain.do(err, data);
      this.next = () => api.metasync.each(this.array, fn, finish);
      return chain;
    }

    series(fn) {
      const chain = this.chain();
      const finish = (err, data) => chain.do(err, data);
      this.next = () => api.metasync.series(this.array, fn, finish);
      return chain;
    }

    find(fn) {
      const chain = this.chain();
      const finish = (data) => chain.do(null, data);
      this.next = () => api.metasync.find(this.array, fn, finish);
      return chain;
    }

  }

  api.metasync.for = (
    // Create an ArrayChain instance
    array // array to process
  ) => (
    new ArrayChain(array)
  );

};
