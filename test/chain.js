'use strict';

const chai = require('chai');
const metasync = require('..');

const expect = chai.expect;

describe('metasync chaining', () => {

  it('must create and execute chain from one operation', (done) => {

    const data = [1, 2, 3, 4];
    const expected = [2, 4, 6, 8];
    const fn = (item, callback) => process.nextTick(() => {
      callback(null, item * 2);
    });

    metasync.for(data).map(fn).fetch((err, result) => {
      expect(err).not.to.exist;
      expect(result).to.exist;
      expect(result).to.be.an('Array');
      expect(result).to.be.deep.equal(expected);
      done();
    });

  });

});
