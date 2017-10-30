'use strict';

const fs = require('fs');
const metasync = require('..');

const getPerson = (data, cb) => {
  const persons = [
    { name: 'Marcus Aurelius', city: 'Rome', born: 121 },
    { name: 'Mao Zedong', city: 'Shaoshan', born: 1893 },
  ];
  data.person = persons.find(p => p.name === data.name);
  cb();
};

const lookupCountry = (data, cb) => {
  const dictionary = [
    { name: 'Rome', country: 'Roman Empire' },
    { name: 'Shaoshan', country: 'Quin Empire' },
  ];
  data.country = dictionary[data.person.name];
  cb();
};

const readFile = (data, cb) => {
  fs.readFile(data.file, cb);
};

const prepareResult = (data, cb) => {
  data.result = {};
  cb();
};

const fc = metasync([
  getPerson, [[lookupCountry, readFile]], prepareResult
]);

fc({
  name: 'Mao Zedong',
  file: '../AUTHORS'
}, (err, data) => {
  console.log(data);
});
