//  --- pre.js ---
/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull) u8array.length = numBytesWritten;
    return u8array;
}

/** @type {function(*, string=)} */
function assert(condition, text) {
    if (!condition) {
        console.error("ASSERT: " + text);
        // This build was created without ASSERTIONS defined.  `assert()` should not
        // ever be called in this configuration but in case there are callers in
        // the wild leave this simple abort() implemenation here for now.
        abort(text);
    }
}
//  --- pre.js ---