'use strict';

const fs = require('fs');
const assert = require('assert');
const metasync = require('..');

const getPerson = (data, cb) => {
  const persons = [
    { name: 'Marcus Aurelius', city: 'Rome', born: 121 },
    { name: 'Mao Zedong', city: 'Shaoshan', born: 1893 },
  ];
  const person = persons.find(p => p.name === data.name);
  cb(null, { person });
};

const lookupCountry = (data, cb) => {
  const dictionary = {
    Rome: 'Roman Empire',
    Shaoshan: 'Quin Empire',
  };
  const country = dictionary[data.person.city];
  cb(null, { country });
};

const readFile = (data, cb) => {
  fs.readFile(data.file, (err, buffer) => {
    cb(null, { buffer });
  });
};

const prepareResult = (data, cb) => {
  const result = Object.assign({}, data.person, {
    country: data.country,
    length: data.buffer.length
  });
  cb(null, { result });
};

const fc = metasync([
  getPerson, [[lookupCountry, readFile]], prepareResult
]);

fc({
  name: 'Mao Zedong',
  file: './AUTHORS'
}, (err, data) => {
  const expected = {
    name: 'Mao Zedong',
    city: 'Shaoshan',
    born: 1893,
    country: 'Quin Empire',
    length: 318
  };
  assert.deepEqual(data.result, expected);
});
