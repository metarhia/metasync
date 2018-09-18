'use strict';

const createItems = (factory, n) => Array.from({ length: n }, factory);

const wrapCallback = callback => item => {
  setImmediate(() => callback(item));
};

const poolify = (factory, min, norm, max) => {
  let allocated = norm;
  const items = createItems(factory, norm);
  const delayed = [];
  return arg => {
    if (arg !== undefined && typeof arg !== 'function') {
      if (delayed.length > 0) delayed.shift()(arg);
      else items.push(arg);
      return;
    }
    if (items.length < min && allocated < max) {
      const grow = Math.min(max - allocated, norm - items.length);
      allocated += grow;
      items.push(...createItems(factory, grow));
    }
    const res = items.pop();
    if (!arg) return res;
    const callback = wrapCallback(arg);
    if (res) callback(res);
    else delayed.push(callback);
  };
};

module.exports = { poolify };
