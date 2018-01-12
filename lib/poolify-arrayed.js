'use strict';

const duplicate = (factory, n) => (
  new Array(n).fill().map(() => {
    const instance = factory();
    return instance;
  })
);

const provide = callback => item => {
  setImmediate(() => {
    callback(item);
  });
};

const poolify = (factory, min, norm, max) => {
  let allocated = norm;
  const pool = (par) => {
    if (Array.isArray(par)) {
      par.forEach(item => {
        const delayed = pool.delayed.pop();
        if (delayed) {
          delayed(item);
          par.shift();
        }
      });
      par.forEach(item => pool.items.push(item));
      return;
    }
    if (pool.items.length < min && allocated < max) {
      const grow = Math.min(max - allocated, norm - pool.items.length);
      allocated += grow;
      const items = duplicate(factory, grow);
      pool.items.push(...items);
    }
    const callback = provide(par);
    const res = pool.items.pop();
    if (res) callback(res);
    else pool.delayed.push(callback);
  };
  return Object.assign(pool, {
    items: duplicate(factory, norm),
    delayed: []
  });
};

module.exports = {
  poolify,
};
