'use strict';

const chai = require('chai');
const metasync = require('..');

const expect = chai.expect;

describe('metasync', () => {

  describe('#find', () => {

    it('must handle an error', (done) => {

      const data = [1, 2, 3];
      const predicate = (item, callback) => process.nextTick(() => {
        if (item % 2 === 0) {
          callback(new Error('Intentional error'));
        } else {
          callback(null, true);
        }
      });

      metasync.find(data, predicate, (err) => {
        expect(err).to.exist;
        expect(err).to.be.an('Error');
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
        expect(err).not.to.exist;
        expect(result).to.exist;
        expect(result).to.be.an('Array');
        expect(result).to.be.deep.equal(expected);
        done();
      });

    });

  });

});
