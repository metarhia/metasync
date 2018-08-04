echo Parallel execution: concurrency 6 x 1mln
node tests/load/parallel.promise.js
node tests/load/parallel.compose.js
node tests/load/parallel.collect.js
echo
echo Sequential execution: concurrency 6 x 100k
node tests/load/sequential.promise.js
node tests/load/sequential.compose.js
echo
echo Poolify: array vs symbol 300 times
node tests/load/poolify.array.js
node tests/load/poolify.symbol.js
node tests/load/poolify.opt.js
echo
echo Collector: 1mnl
node tests/load/collect.js
node tests/load/collect.class.js
node tests/load/collect.prototype.js
node tests/load/collect.functor.js
