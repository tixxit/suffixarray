/* Copyright (c) 2011, Tom Switzer (thomas.switzer@gmail.com)
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

/**
 * An implementation of the linear time suffix array construction of 
 * Karkkainen & Sanders:
 *
 * "Simple Linear Work Suffix Array Construction", Karkainen and Sanders.
 *
 * Creating a suffix array is very simple; just call suffixArray(...) with
 * either a string or a function that returns integers and its length. For
 * example,
 *
 * var s = "Sort this!";
 * suffixArray(s);                  // Returns [4, 9, 0, 6, 7, 1, 2, 8, 3, 5].
 *
 * function reverse(i) { return s.charCodeAt(s.length - 1 - i) }
 * suffixArray(reverse, s.length);  // Returns [5, 0, 9, 3, 2, 8, 7, 1, 4, 6].
 *
 * @author Thomas Switzer
 */
(function() {

var global = this,
    floor = Math.floor,
    identity = function(x) { return x },
    undefined;

/**
 * Sorts an array of (unsigned) integers in linear time. The values of the
 * array (a) act as keys, which are passed to the key function which returns an
 * integer value.
 *
 * @param a An array of keys to sort.
 * @param key A function that maps keys to integer values.
 * @return The array a.
 */
function bsort(a, key) {
    var len = a.length,
        buckets = [],
        i = len, j = -1, b, d = 0,
        keys = 0,
        bits;
    key = key || identity;
    while (i--)
        j = Math.max(key(a[i]), j);
    bits = j >> 24 && 32 || j >> 16 && 24 || j >> 8 && 16 || 8;
    for (; d < bits; d += 4) {
        for (i = 16; i--;)
            buckets[i] = [];
        for (i = len; i--;)
            buckets[(key(a[i]) >> d) & 15].push(a[i]);
        for (b = 0; b < 16; b++)
            for (j = buckets[b].length; j--;)
                a[++i] = buckets[b][j];
    }
    return a;
}


/**
 * Returns the suffix array of the string s. The suffix array is constructed
 * in linear time.
 *
 * The string s can either be an Unicode string (ie. JavaScript String object)
 * or a function that takes an index (integer >= 0) and returns another
 * integer (a "symbol"). If a function is provided, then another argument
 * specifying its length (integer >= 0) must be provided.
 *
 * The returned array contains the indexes of the string in the lexicographical
 * order of the suffixes that start at those indexes.
 *
 * @param s A string or function that maps ints between [0, len) to integers.
 * @param len The length of s (optional if s is a string, required otherwise).
 * @return An array of indexes into s.
 */
global.suffixArray = function(s, len) {
    return Object.prototype.toString.call(s) == "[object String]"
        ? suffixArray(function(i) { return s.charCodeAt(i) }, len || s.length)
        : _suffixArray(function(i) { return i >= len ? 0 : s(i) }, len);
}


/* Constructs the suffix array of s. In this case, s must be a function that
 * maps integers between 0 and len - 1 to "symbols" (unsigned integers). It
 * returns the suffixes in lexicographical order as an array of indexes where
 * those suffixes start.
 *
 * I have tried to keep the code reasonably well commented. Both for my sake,
 * and yours. That said, my code was not written with pedagogy in mind, but
 * to be relatively fast and have a small minified size.
 *
 * The description of the algorithm in the paper is very concise and is well
 * worth a read.
 *
 * The C code accompanying the paper is very terse and, IMHO, creates more
 * confusion than clarity. While the algorithm itself is fairly simple (simple
 * and fast, who wants more?), it does deal with quite a bit of abstraction.
 * That is, you are dealing with a lot of placeholders, rather than concrete
 * objects; indexes into the string to represent suffixes, lexical names
 * representing triplets of symbols, indexes of these lexical names, etc.
 */
function _suffixArray(s, len) {
    var a = [],
        b = [],
        alen = floor(2 * len / 3),  // Number of indexes s.t. i % 3 != 0.
        blen = len - alen,          // Number of indexes s.t. i % 3 = 0.
        r = (alen + 1) >> 1,        // Number of indexes s.t. i % 3 = 1.
        i = alen,
        j = 0,
        k,
        lookup = [],
        result = [],
        tmp;

    // Sort suffixes w/ indices % 3 != 0 by their first 3 symbols (triplets).

    while (i--)
        a[i] = ((i * 3) >> 1) + 1;  // a = [1, 2, 4, 5, 7, 8, 10, 11, 13, ...]

    for (i = 3; i--;)
        bsort(a, function(j) { return s(i + j) });

    // Assign lexicographical names (j) to the triplets of consecutive symbols,
    // s.t. the order of the lex. names match the lex. order of the triplets.

    // Array b contains lex. names in the order they appear in s for i % 3 != 0

    j = b[floor(a[0] / 3) + (a[0] % 3 == 1 ? 0 : r)] = 0;
    for (i = 1; i < alen; i++) {
        if (s(a[i]) != s(a[i-1]) || s(a[i] + 1) != s(a[i-1] + 1) || s(a[i] + 2) != s(a[i-1] + 2))
            j++;
        b[floor(a[i] / 3) + (a[i] % 3 == 1 ? 0 : r)] = j;
    }

    // If all lex. names are unique, then a is already completely sorted.

    if (j < alen - 1) {

        // Otherwise, recursively sort lex. names in b, then reconstruct the
        // indexes of the sorted array b so they are relative to a.
        
        b = _suffixArray(function(i) { return i >= alen ? 0 : b[i] }, alen);
        for (i = alen; i--;)
            a[i] = b[i] < r ? b[i] * 3 + 1 : ((b[i] - r) * 3 + 2);
    }
    
    // Sort remaining suffixes (i % 3 == 0) using prev result (i % 3 != 0).

    b = [];
    for (i = 0; i < alen; i++)
        if (a[i] % 3 == 1)
            b.push(a[i] - 1);
    if (len % 3 == 1)
        b.push(len - 1);    // Handle case where a[i] = len doesn't exist.
    bsort(b, function(j) { return s(j) });

    // Create a reverse lookup table for the indexes i, s.t. i % 3 != 0.
    // This table can be used to simply determine the sorted order of 2
    // suffixes whose indexes are both not divisible by 3.

    while (i--)
        lookup[a[i]] = i;

    // Merge a (i % 3 != 0) and b (i % 3 == 0) together. We only need to
    // compare, at most, 2 symbols before we end up comparing 2 suffixes whose
    // indices are both not divisible by 3. At this point, we can use the
    // reverse lookup array to order them.

    for (i = 0, j = 0, k = 0; i < alen && j < blen;) {
        tmp = (s(a[i]) - s(b[j])) || (a[i] % 3 == 2
            ? (s(a[i] + 1) - s(b[j] + 1)) || (lookup[a[i] + 2] - lookup[b[j] + 2])
            : (lookup[a[i] + 1] - lookup[b[j] + 1])
        )
        result[k++] = tmp < 0 ? a[i++] : b[j++];
    }
    while (i < alen)
        result[k++] = a[i++];
    while (j < blen)
        result[k++] = b[j++];

    return result;
}

}).call();
