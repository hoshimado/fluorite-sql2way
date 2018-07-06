/**
 * [method.js]
 */

var createHookPoint = require("../../hook-test-helper").createHookPoint;
var sqlite3 = createHookPoint(exports,"sqlite3",require("sqlite3"));


exports.getAssociatedKey = function ( baseKey ) {
    return new Promise(function (resolve,reject) {
        var instance = sqlite3.verbose();
        var connect = new instance.Database(
            "データベースのパスは後で",
            function(err){
                if(!err){
                    resolve(connect);
                }else{
                    reject(err);
                }
            }
        );
    }).then(function (connect) {
        return new Promise(function(resolve) {
            var query_str = "SELECT ";
            query_str += "[serial], [associated] FROM [tablename] ";
            query_str += "WHERE [serial]='" + baseKey + "'";
            var result = {
                "connect" : connect
            };
            connect.all(
                query_str, 
                [], 
                function (err, rows) {
                    if(!err){
                        result["rows"] = rows;
                    }else{
                        result["err"] = err;
                    }
                    resolve(result);
                }
            );
        });
    }).then(function (params) {
        return new Promise(function(resolve,reject) {
            params.connect.close(function (err) {
                err = err ? err : params.err;
                if(!err){
                    resolve(params.rows);
                }else{
                    reject(err);
                }
            });
        });
    }).then(function (rows) {
        return Promise.resolve({
            "status" : 200,
            "associated_key" : rows[0].associated
        });
    });
};

