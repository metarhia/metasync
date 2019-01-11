'use strict';

const metatests = require('metatests');
const metasync = require('..');
const fs = require('fs');

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

const prepareResult = (context, cb) => {
  const result = Object.assign({}, context.person, {
    country: context.country,
    length: context.buffer.length,
  });
  cb(null, { result });
};

metatests.test('async functions composition pause in the middle', test => {
  const readFile = (context, cb) => {
    fs.readFile(context.file, (err, buffer) => {
      test.error(err);
      cb(null, { buffer });
    });
  };

  const fc = metasync([getPerson, [[lookupCountry, readFile]], prepareResult]);

  fc(
    {
      name: 'Mao Zedong',
      file: './AUTHORS',
    },
    (err, context) => {
      test.error(err);
      const expected = {
        name: 'Mao Zedong',
        city: 'Shaoshan',
        born: 1893,
        country: 'Quin Empire',
        length: 318,
      };
      test.strictSame(context.result, expected);
      test.end();
    }
  );

  process.nextTick(() => {
    fc.pause();
    setTimeout(() => {
      fc.resume();
    }, 1000);
  });
});
