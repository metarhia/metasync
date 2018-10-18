'use strict';

const poolified = Symbol('poolified');

const mixFlag = { [poolified]: true };

const duplicate = (factory, n) => Array
  .from({ length: n }, factory)
  .map(instance => Object.assign(instance, mixFlag));

const provide = callback => item => {
  setImmediate(() => {
    callback(item);
  });
};

const poolify = (factory, min, norm, max) => {
  let allocated = norm;
  const pool = par => {
    if (par && par[poolified]) {
      const delayed = pool.delayed.shift();
      if (delayed) delayed(par);
      else pool.items.push(par);
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
