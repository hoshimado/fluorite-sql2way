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
    "db" : new lib.Factory( {} ) // データベースごとにハッシュマップで持つ。
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
	var db = factoryImpl.db.getInstance();
	var databaseName = sqlConfig.database;
	if( db[ databaseName ] ){
        outJsonData["result"] = "sql connection is OK already!";
		return Promise.resolve( inputDataObj )
	}else{
		return new Promise(function(resolve,reject){
			var sqlite = sqlite3 = factoryImpl.sqlite3.getInstance().verbose();
			var db_connect = new sqlite.Database( sqlConfig.database, (err) =>{
				if( !err ){
					db[ databaseName ] = db_connect;
					outJsonData["result"] = "sql connection is OK!";

					resolve( inputDataObj );
				}else{
					outJsonData[ "errer_on_connection" ] = err;
					reject(err);
				}
			});
		});
	}
};
exports.createPromiseForSqlConnection = createPromiseForSqlConnection;


var closeConnection = function( databaseName ){
	var dbs = factoryImpl.db.getInstance();
	var db = dbs[ databaseName ];
	if( !db ){
		return Promise.reject({
			"isReady" : false
		});
	}

    return new Promise(function(resolve,reject){
		db.close((err)=>{
			if(!err){
				resolve();
			}else{
				reject(err)
			}
		});
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
	var dbs = factoryImpl.db.getInstance();
	var db = dbs[ databaseName ];
	if( !db ){
		return Promise.reject({
			"isReady" : false
		});
	}

	return new Promise(function(resolve,reject){
		var query_str = "SELECT owners_hash, max_entrys";
		query_str += " FROM owners_permission";
		query_str += " WHERE [owners_hash]='" + deviceKey + "'";

		db.all(query_str, [], (err, rows) => { // get()でショートハンドしても良いが、Queryの分かりやすさ考慮でall()する。
			if(!err){
				if( rows.length > 0 ){
					resolve( rows[0].max_entrys );
				}else{
					reject({
						"isDevicePermission" : false
					});
				}
			}else{
				reject({
					"isEnableValidationProcedure" : false
				});
			}
		});
	});
}
exports.isOwnerValid = isOwnerValid;





var addActivityLog2Database = function( databaseName, deviceKey, typeOfAction ){
	var dbs = factoryImpl.db.getInstance();
	var db = dbs[ databaseName ];
	if( !db ){
		return Promise.reject({
			"isReady" : false
		});
	}

	return new Promise(function(resolve,reject){
		var now_date = new Date();
		var date_str = now_date.toFormat("YYYY-MM-DD HH24:MI:SS.000"); // data-utilsモジュールでの拡張を利用。
		var query_str = "INSERT INTO activitylogs(created_at, type, owners_hash ) VALUES('" + date_str + "', " + typeOfAction + ", '" + deviceKey + "')";

		db.all(query_str, [], (err, rows) => {
			if(!err){
				var insertedData = {
					"type" : typeOfAction,
					"device_key" : deviceKey
				};
				return resolve( insertedData );
			}else{
				reject({
					"isEnableValidationProcedure" : false
				});
			}
		});
	});
};
exports.addActivityLog2Database = addActivityLog2Database;




/**
 * デバイス識別キーに紐づいたバッテリーログを、指定されたデータベースから取得する。
 * @param{String} Database データベース名
 * @param{String} deviceKey デバイスの識別キー
 * @param{Object} period 取得する日付の期間 { start : null, end : null }を許容する。ただし、使う場合はyyyy-mm-dd整形済みを前提。
 * @returns{Promise} SQLからの取得結果を返すPromiseオブジェクト。成功時resolve( recordset ) 、失敗時reject( err )。
 */
var getListOfActivityLogWhereDeviceKey = function( databaseName, deviceKey, period ){
	var dbs = factoryImpl.db.getInstance();
	var db = dbs[ databaseName ];
	if( !db ){
		return Promise.reject({
			"isReady" : false
		});
	}

	var query_str = "SELECT created_at, type FROM activitylogs";
	query_str += " WHERE [owners_hash]='" + deviceKey + "'"; // 固定長文字列でも、後ろの空白は無視してくれるようだ。
	// http://sql55.com/column/string-comparison.php
	// > SQL Server では文字列を比較する際、比較対象の 2 つの文字列の長さが違った場合、
	// > 短い方の文字列の後ろにスペースを足して、長さの長い方にあわせてから比較します。
	if( period && period.start ){
		query_str += " AND [created_at] > '";
		query_str += period.start;
		query_str += "'";
	}
	if( period && period.end ){
		query_str += " AND [created_at] <= '";
		query_str += period.end;
		query_str += " 23:59'"; // その日の最後、として指定する。※「T」は付けない（json変換後だと付いてくるけど）
	}

	return new Promise(function(resolve,reject){
		db.all(query_str, [], (err, rows) => {
			if(!err){
				return resolve( rows );
			}else{
				return reject( err );
			}
		});
	});
};
exports.getListOfActivityLogWhereDeviceKey = getListOfActivityLogWhereDeviceKey;






