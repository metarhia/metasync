'use strict';

const fs = require('fs');
const assert = require('assert');
const metasync = require('..');

const getPerson = (context, cb) => {
  const persons = [
    { name: 'Marcus Aurelius', city: 'Rome', born: 121 },
    { name: 'Mao Zedong', city: 'Shaoshan', born: 1893 },
  ];
  const person = persons.find(p => p.name === context.name);
  cb(null, { person });
};

const lookupCountry = (context, cb) => {
  const dictionary = {
    Rome: 'Roman Empire',
    Shaoshan: 'Quin Empire',
  };
  const country = dictionary[context.person.city];
  cb(null, { country });
};

const readFile = (context, cb) => {
  fs.readFile(context.file, (err, buffer) => {
    assert.ifError(err);
    cb(null, { buffer });
  });
};

const prepareResult = (context, cb) => {
  const result = Object.assign({}, context.person, {
    country: context.country,
    length: context.buffer.length,
  });
  cb(null, { result });
};

const fc = metasync([
  getPerson, [[lookupCountry, readFile]], prepareResult,
]);

fc({
  name: 'Mao Zedong',
  file: './AUTHORS',
}, (err, context) => {
  assert.ifError(err);
  const expected = {
    name: 'Mao Zedong',
    city: 'Shaoshan',
    born: 1893,
    country: 'Quin Empire',
    length: 318,
  };
  assert.deepEqual(context.result, expected);
});

process.nextTick(() => {
  fc.pause();
  setTimeout(() => {
    fc.resume();
  }, 1000);
});
