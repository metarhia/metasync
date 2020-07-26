'use strict';

const path = require('path');
const { fork } = require('child_process');
const { once } = require('events');

const metatests = require('metatests');
const { AsyncIterator, asyncIter } = require('../../');

const array = [1, 2, 3, 4];

metatests.test('new AsyncIterator() on non Iterable', test => {
  test.throws(() => {
    new AsyncIterator(2);
  }, new TypeError('Base is not Iterable'));
  test.end();
});

metatests.test('AsyncIterator.throttle with min value', test => {
  const expectedMin = 1;
  const { min } = asyncIter([]).throttle(1, expectedMin);
  test.strictSame(min, expectedMin);
  test.end();
});

metatests.test('new AsyncIterator() on AsyncIterable', test => {
  const iterator = array[Symbol.iterator]();
  const iterable = {
    [Symbol.asyncIterator]: () => ({ next: async () => iterator.next() }),
  };

  const iter = asyncIter(iterable);
  test.assert(iter instanceof AsyncIterator);
  test.end();
});

metatests.test('next returns Promise', test => {
  const iter = asyncIter(array);
  const item = iter.next();

  test.assert(item instanceof Promise);
  test.end();
});

metatests.test('iter returns an AsyncIterator', test => {
  const iterator = asyncIter(array);
  test.assert(iterator instanceof AsyncIterator);
  test.end();
});

metatests.test('AsyncIterator is Iterable', async test => {
  const iterator = asyncIter(array);
  let sum = 0;
  for await (const value of iterator) {
    sum += value;
  }

  test.strictSame(sum, 10);
  test.end();
});

metatests.test('AsyncIterator.count', async test => {
  test.strictSame(await asyncIter(array).count(), array.length);
  test.end();
});

metatests.test('AsyncIterator.count on consumed iterator', async test => {
  const count = await asyncIter(array).skip(array.length).count();
  test.strictSame(count, 0);
  test.end();
});

metatests.test('AsyncIterator.each', async test => {
  const iterator = asyncIter(array);
  let sum = 0;
  await iterator.each(value => {
    sum += value;
  });

  test.strictSame(sum, 10);
  test.end();
});

metatests.test('AsyncIterator.forEach', async test => {
  const iterator = asyncIter(array);
  let sum = 0;
  await iterator.forEach(value => {
    sum += value;
  });

  test.strictSame(sum, 10);
  test.end();
});

metatests.test('AsyncIterator.parallel', async test => {
  const iterator = asyncIter(array);
  let sum = 0;
  await iterator.parallel(value => {
    sum += value;
  });

  test.strictSame(sum, 10);
  test.end();
});

metatests.test('AsyncIterator.forEach with thisArg ', async test => {
  const iterator = asyncIter(array);
  const obj = {
    sum: 0,
    fn(value) {
      this.sum += value;
    },
  };

  await iterator.forEach(obj.fn, obj);

  test.strictSame(obj.sum, 10);
  test.end();
});

metatests.test('AsyncIterator.reduce', async test => {
  test.strictSame(
    await asyncIter(array).reduce((acc, current) => acc + current, 0),
    10
  );
  test.end();
});

metatests.test('AsyncIterator.reduce with no initialValue', async test => {
  test.strictSame(
    await asyncIter(array).reduce((acc, current) => acc + current),
    10
  );
  test.end();
});

metatests.test(
  'AsyncIterator.reduce with no initialValue on consumed iterator',
  async test => {
    const iterator = asyncIter(array);
    await test.rejects(
      iterator
        .reduce(() => {})
        .then(() => iterator.reduce((acc, current) => acc + current)),
      new TypeError('Reduce of consumed async iterator with no initial value')
    );
  }
);

metatests.test('AsyncIterator.map', async test => {
  test.strictSame(
    await asyncIter(array)
      .map(value => value * 2)
      .toArray(),
    [2, 4, 6, 8]
  );
  test.end();
});

metatests.test('AsyncIterator.map with thisArg', async test => {
  const obj = {
    multiplier: 2,
    mapper(value) {
      return value * this.multiplier;
    },
  };

  test.strictSame(await asyncIter(array).map(obj.mapper, obj).toArray(), [
    2,
    4,
    6,
    8,
  ]);
  test.end();
});

metatests.test('AsyncIterator.filter', async test => {
  test.strictSame(
    await asyncIter(array)
      .filter(value => !(value % 2))
      .toArray(),
    [2, 4]
  );
  test.end();
});

metatests.test('AsyncIterator.filter with thisArg', async test => {
  const obj = {
    divider: 2,
    predicate(value) {
      return !(value % this.divider);
    },
  };

  test.strictSame(await asyncIter(array).filter(obj.predicate, obj).toArray(), [
    2,
    4,
  ]);
  test.end();
});

metatests.test('AsyncIterator.flat', async test => {
  const array = [[[[1], 2], 3], 4];
  const flatArray = [1, 2, 3, 4];
  const newArray = await asyncIter(array).flat(3).toArray();
  test.strictSame(newArray, flatArray);
  test.end();
});

metatests.test('AsyncIterator.flat with no depth', async test => {
  const array = [[[[1], 2], 3], 4];
  const flatArray = [[[1], 2], 3, 4];
  const newArray = await asyncIter(array).flat().toArray();
  test.strictSame(newArray, flatArray);
  test.end();
});

metatests.test('AsyncIterator.flatMap', async test => {
  const array = [1, 2, 3];
  const result = [1, 1, 2, 2, 3, 3];
  const newArray = await asyncIter(array)
    .flatMap(element => [element, element])
    .toArray();

  test.strictSame(newArray, result);
  test.end();
});

metatests.test(
  'AsyncIterator.flatMap that returns neither AsyncIterator nor Iterable',
  async test => {
    const array = [1, 2, 3];
    const result = [2, 4, 6];
    const newArray = await asyncIter(array)
      .flatMap(element => element * 2)
      .toArray();

    test.strictSame(newArray, result);
    test.end();
  }
);

metatests.test('AsyncIterator.flatMap with thisArg', async test => {
  const obj = {
    value: 1,
    mapper(element) {
      return [element, this.value];
    },
  };

  const array = [1, 2, 3];
  const result = [1, 1, 2, 1, 3, 1];
  test.strictSame(
    await asyncIter(array).flatMap(obj.mapper, obj).toArray(),
    result
  );
  test.end();
});

metatests.test('AsyncIterator.zip', async test => {
  const it = asyncIter(array);
  const itr = asyncIter(array).take(3);
  const iterator = asyncIter(array).take(2);

  const zipIter = it.zip(itr, iterator);
  test.strictSame(await zipIter.toArray(), [
    [1, 1, 1],
    [2, 2, 2],
  ]);
  test.end();
});

metatests.test('AsyncIterator.chain', async test => {
  const it = asyncIter(array).take(1);
  const itr = await asyncIter(array).skip(1).take(1);
  const iterator = await asyncIter(array).skip(2).take(2);
  test.strictSame(await it.chain(itr, iterator).toArray(), [1, 2, 3, 4]);
  test.end();
});

metatests.test('AsyncIterator.take', async test => {
  const it = asyncIter(array).take(2);
  test.strictSame((await it.next()).value, 1);
  test.strictSame((await it.next()).value, 2);
  test.assert((await it.next()).done);
  test.end();
});

metatests.testSync('AsyncIterator.takeWhile', async test => {
  const it = asyncIter(array).takeWhile(x => x < 3);
  test.strictSame(await it.toArray(), [1, 2]);
  test.assert(it.next().done);
});

metatests.test('AsyncIterator.skip', async test => {
  const it = asyncIter(array).skip(2);
  test.strictSame((await it.next()).value, 3);
  test.strictSame((await it.next()).value, 4);
  test.assert((await it.next()).done);
  test.end();
});

metatests.test('AsyncIterator.every that must return true', async test => {
  test.assert(await asyncIter(array).every(element => element > 0));
  test.end();
});

metatests.test('AsyncIterator.every that must return false', async test => {
  test.assertNot(await asyncIter(array).every(element => element % 2));
  test.end();
});

metatests.test('AsyncIterator.every with thisArg', async test => {
  const obj = {
    min: 0,
    predicate(value) {
      return value > this.min;
    },
  };

  test.assert(await asyncIter(array).every(obj.predicate, obj));
  test.end();
});

metatests.test('AsyncIterator.some that must return true', async test => {
  test.assert(await asyncIter(array).some(element => element % 2));
  test.end();
});

metatests.test('AsyncIterator.some that must return false', async test => {
  test.assertNot(await asyncIter(array).some(element => element < 0));
  test.end();
});

metatests.test('AsyncIterator.some with thisArg', async test => {
  const obj = {
    max: 2,
    predicate(value) {
      return value < this.max;
    },
  };

  test.assert(await asyncIter(array).some(obj.predicate, obj));
  test.end();
});

metatests.testSync(
  'AsyncIterator.someCount that must return true',
  async test => {
    test.assert(await asyncIter(array).someCount(element => element % 2, 2));
  }
);

metatests.testSync(
  'AsyncIterator.someCount that must return false',
  async test => {
    test.assertNot(await asyncIter(array).someCount(element => element % 2, 3));
    test.assertNot(await asyncIter(array).someCount(element => element < 0, 1));
  }
);

metatests.testSync('AsyncIterator.someCount with thisArg', async test => {
  const obj = {
    max: 3,
    predicate(value) {
      return value < this.max;
    },
  };

  test.assert(await asyncIter(array).someCount(obj.predicate, 2, obj));
});

metatests.test('AsyncIterator.find that must find an element', async test => {
  test.strictSame(await asyncIter(array).find(element => element % 2 === 0), 2);
  test.end();
});

metatests.test(
  'AsyncIterator.find that must not find an element',
  async test => {
    test.strictSame(
      await asyncIter(array).find(element => element > 4),
      undefined
    );
    test.end();
  }
);

metatests.test('AsyncIterator.find with thisArg', async test => {
  const obj = {
    divider: 2,
    predicate(value) {
      return value % this.divider === 0;
    },
  };

  test.strictSame(await asyncIter(array).find(obj.predicate, obj), 2);
  test.end();
});

metatests.test('AsyncIterator.includes that must return true', async test => {
  test.assert(await asyncIter(array).includes(1));
  test.end();
});

metatests.test('AsyncIterator.includes with a NaN', async test => {
  test.assert(await asyncIter([1, 2, NaN]).includes(NaN));
  test.end();
});

metatests.test('AsyncIterator.includes that must return false', async test => {
  test.assertNot(await asyncIter(array).includes(0));
  test.end();
});

metatests.test(
  'AsyncIterator.collectTo must collect to given Collection',
  async test => {
    const set = await asyncIter(array).collectTo(Set);
    test.strictSame([...set.values()], array);
    test.end();
  }
);

metatests.test('AsyncIterator.toArray must convert to array', async test => {
  test.strictSame(await asyncIter(array).toArray(), array);
  test.end();
});

metatests.test(
  'AsyncIterator.collectWith must collect to a provided object',
  async test => {
    const set = new Set();
    await asyncIter(array).collectWith(set, (obj, element) => obj.add(element));
    test.strictSame([...set.values()], array);
    test.end();
  }
);

metatests.test('AsyncIterator.throttle', async test => {
  const EXPECTED_DEVIATION = 0.2;

  const pathThrottleFile = path.join(__dirname, './throttle.js');
  const child = fork(pathThrottleFile);

  const [{ sum, actualDeviation, ARRAY_SIZE }] = await once(child, 'message');
  test.strictSame(sum, ARRAY_SIZE);
  test.assert(actualDeviation <= EXPECTED_DEVIATION);
});

metatests.testSync('AsyncIterator.enumerate must return tuples', async test => {
  let i = 0;
  await asyncIter(array)
    .enumerate()
    .forEach(t => {
      test.strictSame(t, [i, array[i]]);
      i++;
    });
});

metatests.testSync('AsyncIterator.enumerate must start from 0', async test => {
  const it = asyncIter(array);
  await it.next();
  let i = 0;
  await it.enumerate().forEach(t => {
    test.strictSame(t, [i, array[i + 1]]);
    i++;
  });
});

metatests.testSync('AsyncIterator.join default', async test => {
  const actual = await asyncIter(array).join();
  test.strictSame(actual, '1,2,3,4');
});

metatests.testSync('AsyncIterator.join', async test => {
  const actual = await asyncIter(array).join(', ');
  test.strictSame(actual, '1, 2, 3, 4');
});

metatests.testSync('AsyncIterator.join with prefix', async test => {
  const actual = await asyncIter(array).join(', ', 'a = ');
  test.strictSame(actual, 'a = 1, 2, 3, 4');
});

metatests.testSync('AsyncIterator.join with suffix', async test => {
  const actual = await asyncIter(array).join(', ', '', ' => 10');
  test.strictSame(actual, '1, 2, 3, 4 => 10');
});

metatests.testSync('AsyncIterator.join with prefix and suffix', async test => {
  const actual = await asyncIter(array).join(', ', '[', ']');
  test.strictSame(actual, '[1, 2, 3, 4]');
});
