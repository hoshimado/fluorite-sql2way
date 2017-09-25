/**
 * [hello.js]
 * 
 * encoding=utf-8
 */

 
/**
 * バッテリーログをSQLから、指定されたデバイス（のハッシュ値）のものを取得する。
 */
exports.world = function( queryFromGet, dataFromPost ){
    var name = queryFromGet.name;
    var out_data = { 
        "status" : 200,
        "jsonData" : "hello world, " + name + "!" 
    };
    var promise = new Promise(function(resolve,reject){
        setTimeout(function() {
            // 非同期の処理を模している。
            resolve( out_data );
        }, 100);
    });
    return promise;
};


