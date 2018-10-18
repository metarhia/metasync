'use strict';

const duplicate = (factory, n) => Array.from({ length: n }, factory);

const provide = callback => item => {
  setImmediate(() => {
    callback(item);
  });
};

const poolify = (factory, min, norm, max) => {
  let allocated = norm;
  const items = duplicate(factory, norm);
  const delayed = [];
  const pool = par => {
    if (Array.isArray(par)) {
      while (par.length) {
        const item = par.shift();
        const request = delayed.shift();
        if (request) request(item);
        else items.push(item);
      }
      return pool;
    }
    if (items.length < min && allocated < max) {
      const grow = Math.min(max - allocated, norm - items.length);
      allocated += grow;
      const instances = duplicate(factory, grow);
      items.push(...instances);
    }
    const res = items.pop();
    if (!par) return res;
    const callback = provide(par);
    if (res) callback(res);
    else delayed.push(callback);
    return pool;
  };
  return pool;
};

module.exports = { poolify };
