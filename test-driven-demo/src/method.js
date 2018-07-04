/**
 * [method.js]
 */

var createHookPoint = require("../../hook-test-helper").createHookPoint;
var sqlite3 = createHookPoint(exports,"sqlite3",require("sqlite3"));


exports.getAssociatedKey = function ( baseKey ) {
    return Promise.resolve();
};

