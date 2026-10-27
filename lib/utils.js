'use strict';

// Merge async step result into shared context (array or object)
const mergeResult = (context, result, isArray) => {
  if (result === context || result === undefined) return;
  if (isArray) context.push(result);
  else if (typeof result === 'object') Object.assign(context, result);
};

module.exports = { mergeResult };
