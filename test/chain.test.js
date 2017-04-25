'use strict';

const metasync = require('..');

describe('metasync chaining', () => {

  test('must create and execute chain from one operation', (done) => {

    const data = [1, 2, 3, 4];
    const expected = [2, 4, 6, 8];
    const fn = (item, callback) => process.nextTick(() => {
      callback(null, item * 2);
    });

    metasync.for(data).map(fn).fetch((err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual(expected);
      done();
    });

  });

});
