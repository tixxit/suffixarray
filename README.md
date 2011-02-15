Suffix Array Construction
=========================

This is a simple JavaScript library that provides one function:

	suffixArray(someString);

This will return the suffix array of an arbitrary string. The string itself can be either a JavaScript (Unicode) string or a function that takes an index (integer &gt;= 0) and returns another integer (a "symbol"). If a function is given, then the length of the string must be given as a second argument. For example,

	suffixArray(function(i) { return ... }, 1000)

Implementation
--------------

This library is a JavaScript implementation of the linear time suffix array construction algorithm of Kärkkäinen and Sanders: *Simple Linear Work Suffix Array Construction*, Kärkkäinen and Sanders.

Questions and/or Comments?
--------------------------

If you have any further questions and/or comments, please fee free to contact me at thomas.switzer@gmail.com .
