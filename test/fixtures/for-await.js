'use strict';

let sum = 0;
async function iter(numbers, doSmth) {
  for await (const number of numbers) {
    doSmth(1);
    sum += number;
  }
  return sum;
}

module.exports = iter;
