Suffix Array Construction
=========================

This is a simple JavaScript library that provides one function:

	suffixArray(someString);

This will return the suffix array of an arbitrary string. The string itself can be either a JavaScript (Unicode) string or a function that takes an index (integer &gt;= 0) and returns another integer (a "symbol"). If a function is given, then the length of the string must be given as a second argument. For example,

	suffixArray(function(i) { return ... }, 1000);

The function takes a third optional argument that can be one of 2 values: `"min"` or `"wrap"` (default is `"min"`). This argument specifies how the end of the string is treated. In the case of `"min"`, the string is assumed to be terminated by trailing `0`s (eg. `suffixArray("aaa", "min")` returns `[ 2, 1, 0 ]`). In the case of `"wrap"`, the string is assumed to wrap back around to the beginning, with no special terminating characters. For example, `suffixArray("baa", "wrap")` returns `[ 1, 2, 0 ]`, where as `suffixArray("baa", "min")` returns `[ 2, 1, 0 ]`.

Implementation
--------------

This library is a JavaScript implementation of the linear time suffix array construction algorithm of Kärkkäinen and Sanders: *Simple Linear Work Suffix Array Construction*, Kärkkäinen and Sanders.

Questions and/or Comments?
--------------------------

If you have any further questions and/or comments, please fee free to contact me at thomas.switzer@gmail.com .
