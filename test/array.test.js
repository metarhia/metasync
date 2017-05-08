'use strict';

const metasync = require('..');

describe('metasync.find', () => {

  it('must handle an error', (done) => {

    const data = [1, 2, 3];
    const expectedErrorMessage = 'Intentional error';
    const predicate = (item, callback) => process.nextTick(() => {
      if (item % 2 === 0) {
        callback(new Error(expectedErrorMessage));
      } else {
        callback(null, false);
      }
    });

    metasync.find(data, predicate, (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual(expectedErrorMessage);
      done();
    });

  });

  it('must find an element', (done) => {

    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const expected = [15];
    const predicate = (item, callback) => process.nextTick(() => {
      callback(null, item % 3 === 0 && item % 5 === 0);
    });

    metasync.find(data, predicate, (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual(expected);
      done();
    });

  });

});
