'use strict';

const duplicate = (factory, n) => (
  new Array(n).fill().map(() => factory())
);

const poolify = (factory, min, norm, max) => {
  let allocated = norm;
  const pool = (par) => {
    if (typeof(par) !== 'function') {
      if (pool.items.length < max) {
        const delayed = pool.delayed.shift();
        if (delayed) delayed(par);
        else pool.items.push(par);
      }
      return;
    }
    if (pool.items.length < min && allocated < max) {
      const grow = Math.min(max - allocated, norm - pool.items.length);
      allocated += grow;
      const items = duplicate(factory, grow);
      pool.items.push(...items);
    }
    const res = pool.items.pop();
    if (res) par(res);
    else pool.delayed.push(par);
  };
  return Object.assign(pool, {
    items: duplicate(factory, norm),
    delayed: []
  });
};

module.exports = {
  poolify,
};
