echo Parallel execution: concurrency 10 x 1mln
node tests/load/parallel.promise.js
node tests/load/parallel.flow.js
node tests/load/parallel.collect.js
echo
echo Sequential execution: concurrency 10 x 100k
node tests/load/sequential.promise.js
node tests/load/sequential.flow.js
