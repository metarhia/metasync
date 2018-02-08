'use strict';

const benchmark = require('./benchmark.js');
const metasync = require('../../lib/poolify.opt.js');

function poolifyNoMixin(done) {

  const buffer = () => new Uint32Array(128);

  const pool = metasync.poolify(buffer, 10, 100, 200);

  for (let i = 0; i < 300; i++) {
    pool(item => {
      setImmediate(() => {
        pool([item]);
        if (i === 300 - 1) {
          done();
        }
      });
    });
  }

}

benchmark.do(10000, [poolifyNoMixin]);
