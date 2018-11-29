'use strict';

let sum = 0;
async function iter(numbers, doSmth) {
  const iterator = numbers[Symbol.asyncIterator]();
  while (true) {
    const { value, done } = await iterator.next();
    if (done) break;
    sum += value;
    doSmth(1);
  }
  return sum;
}

module.exports = iter;
