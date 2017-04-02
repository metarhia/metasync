'use strict';

module.exports = (api) => {

  api.metasync.cb = (
    // Wrap callback
    callback // function (optional)
  ) => {
    let done = false;
    const wrap = (...args) => {
      if (done) return;
      done = true;
      callback(...args);
    };
    return callback ? wrap : api.common.falseness;
  };

};
