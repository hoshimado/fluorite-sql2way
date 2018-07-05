/**
 * [method.js]
 */

var createHookPoint = require("../../hook-test-helper").createHookPoint;
var sqlite3 = createHookPoint(exports,"sqlite3",require("sqlite3"));


exports.getAssociatedKey = function ( baseKey ) {
    return Promise.resolve({
        "associated_key" : "仮実装"
    });
/*
    return new Promise(function (resolve,reject) {
        var instance = sqlite3.verbose();
        var db = new instance.Database("データベース名",function (err) {
            if(!err){
                db.all();
                resolve();
            }else{
                reject();
            }
        });
    });
*/
};

