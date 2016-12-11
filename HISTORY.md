0.0.19 / 2016-12-11
==================

  * Code style

0.0.18 / 2016-12-05
==================

  * Fixed clearTimeout usage, close #25

0.0.17 / 2016-12-01
==================

  * Added arguments to metasync.throttle, issue #20

0.0.16 / 2016-11-30
==================

  * Added final call to metasync.throttle after last function call

0.0.15 / 2016-11-30
==================

  * Implementation of function throttling, close #20

0.0.14 / 2016-08-25
==================

  * ConcurrentQueue fixed

0.0.13 / 2016-08-24
==================

  * Implemented ConcurrentQueue

0.0.12 / 2016-08-23
==================

  * Fixed DataCollector

0.0.11 / 2016-08-23
==================

  * Removed DataCollector.on('collect') event
  * Added errors hash to DataCollector.on('done', function(errs, data))

0.0.10 / 2016-08-23
==================

  * Changed KeyCollector interface
  * Changed ConcurentQueue interface
  * Removed debug output

0.0.9 / 2016-08-21
==================

  * Implemented async reduce
  * Multiple fixes

0.0.8 / 2016-08-17
==================

  * Fixed error returning
  * Removed unused arguments in tests

0.0.7 / 2016-08-14
==================

  * Added data hash for metasync.composition()
  * Added tests and examples
  * Restored done for metasync.composition()

0.0.6 / 2016-08-13
==================

  * Added optional done in metasync.each
  * Fixed another critical bug with done
  * Removed done for metasync.composition()

0.0.5 / 2016-08-03
==================

  * Fixed critical bug, done function is optional now

0.0.4 / 2016-07-30
==================

  * Implemented metasync.each
  * Implemented metasync.series
  * Code style fixes and optimizations

0.0.3 / 2016-07-27
==================

  * Added Trevis CI tests
  * Implemented metasync.filter
  * Implemented metasync.find
  * Code style fixes and optimizations

0.0.2 / 2016-07-23
==================

  * Implemented metasync.composition, issue #1
  * Implemented metasync.parallel
  * Implemented metasync.sequential

0.0.1 / 2016-07-18
==================

  * An event-driven asyncronous data collector implemented: metasync.DataCollector
