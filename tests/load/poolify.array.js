'use strict';

const COUNT = 10000;
const GETS = 300;

const benchmark = require('./benchmark.js');
const metasync = require('../../lib/poolify.js');

const poolifyArray = done => {

  const buffer = () => new Uint32Array(128);
  const pool = metasync.poolify(buffer, 10, 100, 200);

  for (let i = 0; i < GETS; i++) {
    pool(item => {
      setImmediate(() => {
        pool([item]);
        if (i === GETS - 1) done();
      });
    });
  }

};

benchmark.do(COUNT, [poolifyArray]);
