'use strict';

const { AsyncEmitter } = require('..');
const metatests = require('metatests');

metatests.test('AsyncEmitter on/emit', async test => {
  const ae = new AsyncEmitter();

  const fn = test.mustCall(async (a, b, c, d) => {
    test.strictSame(a, 1);
    test.strictSame(b, 2);
    test.strictSame(c, 3);
    test.strictSame(d, 4);
  });

  ae.on('e1', fn);

  await ae.emit('e1', 1, 2, 3, 4);

  test.strictSame(ae.count('e1'), 1);
  test.strictSame(ae.names().length, 1);

  test.end();
});

metatests.test('AsyncEmitter once', async test => {
  const ae = new AsyncEmitter();

  ae.once('e1', test.mustCall());
  ae.once('e1', test.mustCall());

  test.strictSame(ae.count('e1'), 2);
  test.strictSame(ae.names().length, 1);

  await ae.emit('e1');
  await ae.emit('e1');

  test.strictSame(ae.count('e1'), 0);
  test.strictSame(ae.names().length, 0);

  test.end();
});

metatests.test('AsyncEmitter await once', async test => {
  const ae = new AsyncEmitter();

  const fn = test.mustCall(() => {
    test.strictSame(ae.count('e1'), 1);
    test.strictSame(ae.names().length, 1);
    ae.emit('e1');
  });

  setTimeout(fn, 0);
  await ae.once('e1');

  test.strictSame(ae.count('e1'), 0);
  test.strictSame(ae.names().length, 0);

  test.end();
});

metatests.test('AsyncEmitter on/once/emit', async test => {
  const ae = new AsyncEmitter();

  const fn = test.mustCall(() => {}, 2);

  ae.on('e1', fn);
  ae.once('e1', fn);

  test.strictSame(ae.count('e1'), 2);

  ae.emit('e1');

  test.strictSame(ae.names().length, 1);

  test.end();
});

metatests.test('AsyncEmitter remove', async test => {
  const ae = new AsyncEmitter();

  const fn = test.mustCall();

  ae.on('e1', fn);
  ae.emit('e1');

  ae.remove('e1', () => {});
  ae.remove('e1', fn);
  ae.emit('e1');

  test.strictSame(ae.count('e1'), 0);
  test.strictSame(ae.names().length, 0);

  ae.remove('e1', fn);
  ae.emit('e1');

  test.end();
});

metatests.test('AsyncEmitter remove once', async test => {
  const ae = new AsyncEmitter();

  const fn = test.mustNotCall();

  ae.on('e1', fn);
  ae.once('e1', fn);

  test.strictSame(ae.count('e1'), 2);
  test.strictSame(ae.names().length, 1);

  ae.remove('e1', fn);

  test.strictSame(ae.count('e1'), 0);
  test.strictSame(ae.names().length, 0);

  test.end();
});

metatests.test('AsyncEmitter on/once/remove different', async test => {
  const ae = new AsyncEmitter();

  const fn = test.mustNotCall();

  ae.on('e1', fn);
  ae.once('e1', fn);
  ae.remove('e1', fn);
  ae.emit('e1');

  test.strictSame(ae.count('e1'), 0);
  test.strictSame(ae.names().length, 0);

  test.end();
});

metatests.test('AsyncEmitter on/once/remove different', async test => {
  const ae = new AsyncEmitter();

  const fn = test.mustNotCall();

  ae.on('e1', fn);
  ae.once('e2', fn);
  ae.remove('e1', fn);
  ae.emit('e1');

  test.strictSame(ae.count('e1'), 0);
  test.strictSame(ae.count('e2'), 1);
  test.strictSame(ae.names().length, 1);

  test.end();
});

metatests.test('AsyncEmitter clear all', async test => {
  const ae = new AsyncEmitter();

  ae.on('e1', test.mustNotCall());
  ae.clear();
  ae.emit('e1');

  test.strictSame(ae.count('e1'), 0);
  test.strictSame(ae.names().length, 0);

  test.end();
});

metatests.test('AsyncEmitter clear by name', async test => {
  const ae = new AsyncEmitter();

  ae.on('e1', test.mustNotCall());
  ae.clear('e1');
  ae.clear('e2');
  ae.emit('e1');

  test.strictSame(ae.count('e1'), 0);
  test.strictSame(ae.names().length, 0);

  test.end();
});

metatests.test('AsyncEmitter clear once', async test => {
  const ae = new AsyncEmitter();

  ae.once('e1', test.mustNotCall());
  ae.once('e2', test.mustNotCall());

  test.strictSame(ae.count('e1'), 1);
  test.strictSame(ae.count('e2'), 1);
  test.strictSame(ae.names().length, 2);

  ae.clear('e1');
  ae.emit('e1');

  test.strictSame(ae.count('e1'), 0);
  test.strictSame(ae.count('e2'), 1);
  test.strictSame(ae.names().length, 1);

  test.end();
});

metatests.test('AsyncEmitter names', async test => {
  const ae = new AsyncEmitter();

  ae.on('e1', () => {});
  ae.on('e1', () => {});
  ae.on('e2', () => {});
  ae.on('e3', () => {});

  test.strictSame(ae.names(), ['e1', 'e2', 'e3']);

  test.end();
});

metatests.test('AsyncEmitter listeners', async test => {
  const ae = new AsyncEmitter();

  ae.on('e1', () => {});
  ae.on('e1', () => {});
  ae.on('e2', () => {});
  ae.on('e3', () => {});

  test.strictSame(ae.listeners('e1').length, 2);
  test.strictSame(ae.listeners('e2').length, 1);
  test.strictSame(ae.listeners('e3').length, 1);
  test.strictSame(ae.listeners('e4').length, 0);

  test.end();
});

metatests.test('AsyncEmitter await', async test => {
  const ae = new AsyncEmitter();

  ae.on('e1', test.mustCall());
  await ae.emit('e1');

  test.end();
});

metatests.test('AsyncEmitter await multiple listeners', async test => {
  const ae = new AsyncEmitter();

  ae.on('e1', test.mustCall());
  ae.on('e1', test.mustCall());
  ae.on('e1', test.mustCall());

  await ae.emit('e1');

  test.strictSame(ae.count('e1'), 3);
  test.strictSame(ae.names().length, 1);

  test.end();
});

metatests.test('AsyncEmitter await multiple events', async test => {
  const ae = new AsyncEmitter();

  ae.on('e1', test.mustCall());
  ae.on('e2', test.mustCall());

  await ae.emit('e1');
  await ae.emit('e2');

  test.end();
});
