/**
 * [sql_lite_db.js]
 * 
 *  encoding=utf-8
 */


require('date-utils'); // Data() クラスのtoString()を拡張してくれる。
const debug = require("./debugger.js");
var lib = require("./factory4require.js");
var factoryImpl = { // require()を使う代わりに、new Factory() する。
    "sqlite3" : new lib.Factory4Require("sqlite3"),  // https://www.npmjs.com/package/mssql
    "db" : new lib.Factory( null )
};

// UTデバッグ用のHookポイント。運用では外部公開しないメソッドはこっちにまとめる。
exports.factoryImpl = factoryImpl;




/**
 * ※SQL接続生成＋Json応答（OK/NG）、なのでsqliteを直接ではなく、この関数を定義する。
 * 
 * 接続成功時は、resolve( inputDataObj )を返却する。
 * 
 * @param{Object} outJsonData   httpで返却するJSONオブジェクト。生成済みで渡す。中で追加される。
 * @param{Boolean} inputDataObj 受け取ったデータ。POST/GETから変換済み。
 * @param{Object} sqlConfig     SQL接続情報。inputDataObjが有効（invalidメンバ無し）なら、resolve(inputDataObj)する。
 */
var createPromiseForSqlConnection = function( outJsonData, inputDataObj, sqlConfig ){
	return new Promise(function(resolve,reject){
        var sqlite = sqlite3 = factoryImpl.sqlite3.getInstance().verbose();
        var db_connect = new sqlite.Database( sqlConfig.database, (err) =>{
            if( !err ){
                factoryImpl.db.setStub( db_connect );
                outJsonData["result"] = "sql connection is OK!";

                resolve( inputDataObj );
            }else{
                outJsonData[ "errer_on_connection" ] = err;
                reject(err);
            }
        });
	});
};
exports.createPromiseForSqlConnection = createPromiseForSqlConnection;


var closeConnection = function(){
    return new Promise(function(resolve,reject){
        var db = factoryImpl.db.getInstance();
        if( db ){
            db.close((err)=>{
                if(!err){
                    resolve();
                }else{
                    reject(err)
                }
            });
        }else{
            resolve();
        }
    });
};
exports.closeConnection = closeConnection;
    
    


/**
 * SQLへのアクセスが許可されたアクセス元か？
 * 
 * @param{String} databaseName データベース名
 * @param{String} ownerHash アクセスデバイスごとの一意の識別子。これが「認証用SQLデータベース」に入っていればアクセスOK。
 * @returns{Promise} 検証結果。Promise経由で非同期に返る。resolve()は引数無し。reject()はエラー内容が引数に入る。
 */
var isOwnerValid = function( databaseName, deviceKey ){
	return new Promise(function(resolve,reject){
		var mssql = factoryImpl.mssql.getInstance();
		var sql_request = new mssql.Request(); // 【ToDo】：var transaction = new sql.Transaction(/* [connection] */);管理すべき？
		var query_str = "SELECT owners_hash, max_entrys";
		query_str += " FROM [" + databaseName + "].dbo.owners_permission";
		query_str += " WHERE [owners_hash]='" + deviceKey + "'";
		sql_request.query( query_str ).then(function(recordset){
			var n = recordset.length;
			if( 0 < n ){
				resolve( recordset[0].max_entrys );
			}else{
				reject({
					"isDevicePermission" : false
				});
			}
		}).catch(function(err){
			reject({
				"isEnableValidationProcedure" : false
			});
		});	
	});
}
exports.isOwnerValid = isOwnerValid;





var addBatteryLog2Database = function( databaseName, deviceKey, batteryValue ){
	var mssql = factoryImpl.mssql.getInstance();
	var sql_request = new mssql.Request(); // 【ToDo】：var transaction = new sql.Transaction(/* [connection] */);管理すべき？
	var now_date = new Date();
	var date_str = now_date.toFormat("YYYY-MM-DD HH24:MI:SS.000"); // data-utilsモジュールでの拡張を利用。
	var query_str = "INSERT INTO [" + databaseName + "].dbo.batterylogs(created_at, battery, owners_hash ) VALUES('" + date_str + "', " + batteryValue + ", '" + deviceKey + "')";
	return sql_request.query( query_str ).then(function(){
		var insertedData = {
			"battery_value" : batteryValue,
			"device_key" : deviceKey
		};
		return Promise.resolve( insertedData );
	});
};
exports.addBatteryLog2Database = addBatteryLog2Database;






