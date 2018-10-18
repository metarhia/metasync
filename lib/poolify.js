'use strict';

const duplicate = (factory, n) => Array.from({ length: n }, factory);

const provide = callback => item => {
  setImmediate(() => {
    callback(item);
  });
};

const poolify = (factory, min, norm, max) => {
  let allocated = norm;
  const pool = par => {
    if (Array.isArray(par)) {
      while (par.length) {
        const item = par.shift();
        const delayed = pool.delayed.shift();
        if (delayed) delayed(item);
        else pool.items.push(item);
      }
      return pool;
    }
    if (pool.items.length < min && allocated < max) {
      const grow = Math.min(max - allocated, norm - pool.items.length);
      allocated += grow;
      const items = duplicate(factory, grow);
      pool.items.push(...items);
    }
    const res = pool.items.pop();
    if (!par) return res;
    const callback = provide(par);
    if (res) callback(res);
    else pool.delayed.push(callback);
    return pool;
  };
  return Object.assign(pool, {
    items: duplicate(factory, norm),
    delayed: [],
  });
};

module.exports = { poolify };
