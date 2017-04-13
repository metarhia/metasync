'use strict';

module.exports = (api) => {

  function arrayChain(array, prev = null) {

    let next = null, done = null, fail = null;

    const self = (err, data) => {
      array = data;
      if (next) next();
      if (err) {
        if (fail) fail(err);
      } else if (done) {
        done(data);
      }
    };

    self.execute = () => {
      if (prev) {
        prev.execute();
      } else {
        self(null, array);
      }
    };

    self.then = (fn) => (done = fn, self);
    self.catch = (fn) => (fail = fn, self);

    const chain = (performer) => (fn, initial) => {
      const res = arrayChain(null, self);
      next = () => performer(array, fn, res, initial);
      return res;
    };

    self.map = chain(api.metasync.map);
    self.filter = chain(api.metasync.filter);
    self.reduce = chain(api.metasync.reduce);
    self.each = chain(api.metasync.each);
    self.series = chain(api.metasync.series);
    self.find = chain(api.metasync.find);

    return self;
  }

  api.metasync.for = (
    // Create an ArrayChain instance
    array // start mutations from this data
  ) => (
    arrayChain(array)
  );

};
