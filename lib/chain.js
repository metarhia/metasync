'use strict';

module.exports = (api) => {

  function arrayChain(array, prev = null) {
    let self = {};
    self.prev = prev;
    self.next = null;
    self.array = array;
    if (!prev) process.nextTick(() => self.do(null, array));

    self.then = (done) => {
      self.done = done;
      return self;
    };

    self.catch = (fail) => {
      self.fail = fail;
      return self;
    };

    self.do = (err, data) => {
      self.array = data;
      if (self.next) self.next();
      if (err) {
        if (self.fail) self.fail(err);
      } else if (self.done) {
        self.done(data);
      }
    };

    self.chain = () => arrayChain([], self);

    self.map = (fn) => {
      const chain = self.chain();
      const finish = (err, data) => chain.do(err, data);
      self.next = () => api.metasync.map(self.array, fn, finish);
      return chain;
    };

    self.filter = (fn) => {
      const chain = self.chain();
      const finish = (data) => chain.do(null, data);
      self.next = () => api.metasync.filter(self.array, fn, finish);
      return chain;
    };

    self.reduce = (fn, initial) => {
      const chain = self.chain();
      const finish = (err, data) => chain.do(err, data);
      self.next = () => api.metasync.reduce(self.array, fn, finish, initial);
      return chain;
    };

    self.each = (fn) => {
      const chain = self.chain();
      const finish = (err, data) => chain.do(err, data);
      self.next = () => api.metasync.each(self.array, fn, finish);
      return chain;
    };

    self.series = (fn) => {
      const chain = self.chain();
      const finish = (err, data) => chain.do(err, data);
      self.next = () => api.metasync.series(self.array, fn, finish);
      return chain;
    };

    self.find = (fn) => {
      const chain = self.chain();
      const finish = (data) => chain.do(null, data);
      self.next = () => api.metasync.find(self.array, fn, finish);
      return chain;
    };

    return self;
  }

  api.metasync.for = (
    // Create an ArrayChain instance
    array // array to process
  ) => (
    arrayChain(array)
  );

};
