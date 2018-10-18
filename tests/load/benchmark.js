'use strict';

const benchmark = {};
module.exports = benchmark;

const rpad = (s, char, count) => s + char.repeat(count - s.length);
const lpad = (s, char, count) => char.repeat(count - s.length) + s;

benchmark.do = (count, tests) => {
  let fn;
  let i = 0;
  const testCount = tests.length;

  const nextTest = () => {
    i++;
    fn = tests.shift();
    const result = [];
    const begin = process.hrtime();
    let j = 0;

    const nextRepeat = () => {
      fn((err, res) => {
        if (err) {
          console.error(err);
        }
        j++;
        result.push(res);
        if (j < count) {
          nextRepeat();
        } else {
          const end = process.hrtime(begin);
          const diff = end[0] * 1e9 + end[1];
          const time = lpad(diff.toString(), '.', 15);
          const name = rpad(fn.name, '.', 25);
          console.log(name + time + ' nanoseconds');
          if (i < testCount) nextTest();
        }
      });
    };

    nextRepeat();
  };

  nextTest();
};
