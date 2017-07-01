'use strict';

const fs = require('fs');
const metasync = require('..');

const buf = [];

const terms = [') {', ') => {', ') => ('];
const indexing = s => term => s.indexOf(term);

let method, fn, s, pos, lines, title;
for (method in metasync) {
  fn = metasync[method];
  s = fn.toString();
  pos = terms
    .map(indexing(s))
    .filter(k => k !== -1)
    .reduce((prev, cur) => (prev < cur ? prev : cur), s.length);
  if (pos !== -1) {
    s = s.substring(0, pos);
    pos = s.indexOf('\n');
    s = s.substring(pos + 1);
    lines = s.split('\n');
    lines.pop();
    title = lines.shift() || '';
    lines = lines.map(s => (s.length === 0 ? '' : '- ' + s.trim()));
    s = lines.join('\n');
    buf.push(title.trim().replace('//', '##'));
    buf.push('api.metasync.' + method);
    buf.push(s.replace(/\/\/ /g, '') + '\n');
  }
}

const fileName = 'api.txt';
fs.writeFile(fileName, buf.join('\n'), (err) => {
  if (err) throw err;
  else console.log('Saved to ' + fileName);
});
