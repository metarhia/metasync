'use strict';

const metatests = require('metatests');
const common = require('metarhia-common');
const metasync = require('..');
const events = require('events');

global.api = { common, events, metatests, metasync };

api.metatests.namespace({ metasync });

const all = [
  'adapters', 'all', 'chain', 'collectors',
  'array.each', 'array.every', 'array.filter',
  'array.find', 'array.map', 'array.reduce',
  'array.series', 'array.some',
  'compose.clone', 'compose', 'compose.then',
  'control', 'do', 'firstOf', 'memoize',
  'fp.ap', 'fp.asAsync', 'fp.concat', 'fp.fmap', 'fp.of',
  'poolify', 'throttle', 'queue', 'queue.modes'
];

all.forEach(name => require('./' + name));

api.metatests.report();
