/**
 * [activitylog.js]
 * 
 * encoding=utf-8
 */


var lib = require("./factory4require.js");
var factoryImpl = { // require()を使う代わりに、new Factory() する。
    "sql_parts" : new lib.Factory4Require("./sql_lite_db.js"),
};
var _SQL_CONNECTION_CONFIG = require("./sql_config.js");
factoryImpl[ "CONFIG_SQL" ] = new lib.Factory(_SQL_CONNECTION_CONFIG.CONFIG_SQL);
factoryImpl[ "SETUP_KEY" ]  = new lib.Factory(_SQL_CONNECTION_CONFIG.CREATE_KEY);



// UTデバッグ用のHookポイント。運用では外部公開しないメソッドはこっちにまとめる。
exports.factoryImpl = factoryImpl;



/**
 * Promiseで受けわたす、APIの引数チェックしたい！
 * device_key, battery_value, date_start, date_end, max_count
 */
var API_PARAM = function(init){
	this.device_key = init.device_key;
	this.type_value = init.type_value;
	this.date_start = init.date_start;
	this.date_end   = init.date_end;
	this.max_count = init.max_count;
};
var isDefined = function( self, prop ){
	if( !self[prop] ){
		// ここは、正常系では呼ばれないハズなので「console.log()」を直接呼ぶ。
		console.log( "[API_PARAM]::" + prop + " is NOT defind" );
	}
	return self[prop];
};
API_PARAM.prototype.getDeviceKey = function(){ return isDefined( this, "device_key"); };
API_PARAM.prototype.getTypeValue = function(){ return isDefined( this, "type_value"); };
API_PARAM.prototype.getStartDate = function(){ return isDefined( this, "date_start"); };
API_PARAM.prototype.getEndDate   = function(){ return isDefined( this, "date_end"); };
API_PARAM.prototype.getMaxCount = function(){ return isDefined( this, "max_count"); };
exports.API_PARAM = API_PARAM;




/**
 * 基本となるSQLのシークエンス。クラス（というか、プロトタイプ）。
 */
var API_V1_BASE = function( outJsonBuffer ){
	this._outJsonData = outJsonBuffer ? outJsonBuffer : {};
};
API_V1_BASE.prototype.isOwnerValid = function( inputData ){
	// 接続元の認証Y/Nを検証。
	var instance = this;
	var outJsonData = instance._outJsonData;
	var paramClass = new API_PARAM( inputData );

	return new Promise(function(resolve,reject){ // アロー演算子で統一してもいいんだけどね⇒this問題の回避は。
		var config = factoryImpl.CONFIG_SQL.getInstance();
		var isOwnerValid = factoryImpl.sql_parts.getInstance( "isOwnerValid" );
		var is_onwer_valid_promise = isOwnerValid( 
			config.database, 
			paramClass.getDeviceKey() 
		);
		is_onwer_valid_promise.then(function( maxCount ){
			resolve( paramClass ); // ⇒次のthen()が呼ばれる。
		}).catch(function(err){
			if( err ){
				outJsonData[ "errer_on_validation" ] = err;
			}
			reject({
				"http_status" : 401 // Unauthorized
			}); // ⇒次のcatch()が呼ばれる。
		});
	});	
};
API_V1_BASE.prototype.isAccessRateValied = function(){};
API_V1_BASE.prototype.requestSql = function( paramClass ){
	// paramClass =>
	// API_PARAM.prototype.getDeviceKey = function(){ return isDefined( this, "device_key"); };
	// API_PARAM.prototype.getTypeValue = function(){ return isDefined( this, "type_value"); };
	// API_PARAM.prototype.getStartDate = function(){ return isDefined( this, "date_start"); };
	// API_PARAM.prototype.getEndDate   = function(){ return isDefined( this, "date_end"); };
	// API_PARAM.prototype.getMaxCount = function(){ return isDefined( this, "max_count"); };
};
API_V1_BASE.prototype.closeNormal = function(){
	var instance = this;
	var outJsonData = instance._outJsonData;

	return new Promise((resolve,reject)=>{
		var config = factoryImpl.CONFIG_SQL.getInstance();
		var closeConnection = factoryImpl.sql_parts.getInstance().closeConnection;
		closeConnection( config.database ).then(()=>{
			resolve({
				"jsonData" : outJsonData,
				"status" : 200 // OK 【FixMe】直前までの無いように応じて変更する。
			});
		});
	});
};
API_V1_BASE.prototype.closeAnomaly = function( err ){
	var instance = this;
	var outJsonData = instance._outJsonData;

	return new Promise((resolve,reject)=>{
		var config = factoryImpl.CONFIG_SQL.getInstance();
		var closeConnection = factoryImpl.sql_parts.getInstance().closeConnection;
		var http_status = (err && err.http_status) ? err.http_status : 500;

		closeConnection( config.database ).then(()=>{
			resolve({
			"jsonData" : outJsonData,
			"status" : http_status
			}); // 異常系処理を終えたので、戻すのは「正常」。
		});
	});
};
API_V1_BASE.prototype.run = function( inputData ){ // getほげほげObjectFromGetData( queryFromGet );済みを渡す。
	var instance = this;
	var outJsonData = instance._outJsonData;
	var createPromiseForSqlConnection = factoryImpl.sql_parts.getInstance().createPromiseForSqlConnection;

	if( inputData.invalid && inputData.invalid.length > 0 ){
		outJsonData[ "error_on_format" ] = "GET or POST format is INVAILD.";
		return Promise.resolve({
			"jsonData" : outJsonData,
			"status" : 400 // Bad Request
		});
	}

	return createPromiseForSqlConnection( 
		outJsonData, 
		inputData, 
		factoryImpl.CONFIG_SQL.getInstance()
	).then( ( inputData )=>{
		return instance.isOwnerValid( inputData );
  	}).then(function( paramClass ){
		return Promise.resolve( paramClass );
  	}).then( ( paramClass )=>{
		return instance.requestSql( paramClass );
	}).then(function(){
		// ここまですべて正常終了
		return instance.closeNormal();
	}).catch(function(err){
        // どこかでエラーした⇒エラー応答のjson返す。
		return instance.closeAnomaly( err );
	});
};


exports.api_vi_activitylog_setup = function( queryFromGet, dataFromPost ){
	var createPromiseForSqlConnection = factoryImpl.sql_parts.getInstance().createPromiseForSqlConnection;
	var outJsonData = {};
	var config = factoryImpl.CONFIG_SQL.getInstance()
	
	if( dataFromPost.create_key != factoryImpl.SETUP_KEY.getInstance() ){
		return Promise.resolve({
			"jsonData" : outJsonData, // 何も入れないまま。
			"status" : 403 // Forbidden
		});
	}
	return createPromiseForSqlConnection(
		outJsonData,
		{}, // ここは受け渡すだけなので、ダミー。
		config
	).then( (inputData )=>{ // ここで渡されるinputDataは空{}。
		var setupTable1st = factoryImpl.sql_parts.getInstance().setupTable1st;
		return setupTable1st( config.database );
	}).then( (successResultOfTable)=>{
		outJsonData [ "tables" ] = successResultOfTable;
		return Promise.resolve(200);
	}).catch((err)=>{
		outJsonData [ "setup_err" ] = err;
		return Promise.resolve(500);
	}).then(( httpStatus )=>{
		var closeConnection = factoryImpl.sql_parts.getInstance().closeConnection;
		return new Promise((resolve,reject)=>{
			closeConnection( config.database ).then(()=>{
				resolve({
					"jsonData" : outJsonData,
					"status" : httpStatus
				});
			});		
		})
	});
}
exports.api_vi_activitylog_signup = function( queryFromGet, dataFromPost ){
	var createPromiseForSqlConnection = factoryImpl.sql_parts.getInstance().createPromiseForSqlConnection;
	var outJsonData = {};
	var config = factoryImpl.CONFIG_SQL.getInstance()
	
	// ◆ToDo:ここは関数化する。
	if( !(dataFromPost.username) ){ // ◆ToDo:パラメータ検証は要実装◆
		return Promise.resolve({
			"jsonData" : outJsonData, // 何も入れないまま。
			"status" : 403 // Forbidden
		});
	}
	var inputData = {
		"device_key" : dataFromPost.username,
		"password"   : "テストパス"
	};

	return createPromiseForSqlConnection(
		outJsonData,
		inputData,
		config
	).then( (inputData )=>{
		var addNewUser = factoryImpl.sql_parts.getInstance().addNewUser;
		// ◆ToDo：その前に、「登録ユーザー数」の上限判定入れないと！
		// ◆ToDo:↓上限数は環境変数側で持たせる。◆
		return addNewUser( config.database, inputData.device_key, 128, inputData.password );
	}).then( (insertedData)=>{
		outJsonData [ "signuped" ] = insertedData;
		return Promise.resolve(200);
	}).catch((err)=>{
		outJsonData [ "failed" ] = err;
		return Promise.resolve(500);
	}).then(( httpStatus )=>{
		var closeConnection = factoryImpl.sql_parts.getInstance().closeConnection;
		return new Promise((resolve,reject)=>{
			closeConnection( config.database ).then(()=>{
				resolve({
					"jsonData" : outJsonData,
					"status" : httpStatus
				});
			});		
		})
	});
}



/**
 * バッテリーログをSQLから、指定されたデバイス（のハッシュ値）のものを取得する。
 */
exports.api_v1_activitylog_show = function( queryFromGet, dataFromPost ){
	var API_SHOW = function(){
		this._outJsonData = {};
		API_V1_BASE.call( this, this._outJsonData ); // 継承元のコンスタラクタを明示的に呼び出す。
	};
	API_SHOW.prototype = Object.create( API_V1_BASE.prototype );
	API_SHOW.prototype.requestSql = function( paramClass ){
		// 対象のログデータをSQLへ要求
		var outJsonData = this._outJsonData;
		var config = factoryImpl.CONFIG_SQL.getInstance();
	    var getListOfActivityLogWhereDeviceKey = factoryImpl.sql_parts.getInstance().getListOfActivityLogWhereDeviceKey;

		return new Promise(function(resolve,reject){
			getListOfActivityLogWhereDeviceKey(
				config.database, 
				paramClass.getDeviceKey(), 
				{ 
					"start" : paramClass.getStartDate(), 
					"end"   : paramClass.getEndDate()
				}
			).then(function(recordset){
		        // ログ取得処理が成功
				// 【FixME】総登録数（対象のデバイスについて）を取得してjsonに含めて返す。取れなければ null でOK（その場合も成功扱い）。
				outJsonData["table"] = recordset;
				resolve();
			}).catch(function(err){
				// 取得処理で失敗。
				outJsonData[ "error_on_insert" ];
				reject( err ); // ⇒次のcatch()が呼ばれる。
			});
		});
	};
	var subInstance = new API_SHOW();
	var getShowObjectFromGetData = factoryImpl.sql_parts.getInstance().getShowObjectFromGetData;
	var inputData = getShowObjectFromGetData( queryFromGet );
	return subInstance.run( inputData );
};


/**
 * バッテリーログをSQLへ記録するAPI
 */
exports.api_v1_activitylog_add = function( queryFromGet, dataFromPost ){
	var API_ADD = function(){
		this._outJsonData = {};
		API_V1_BASE.call( this, this._outJsonData ); // 継承元のコンスタラクタを明示的に呼び出す。
	};
	API_ADD.prototype = Object.create( API_V1_BASE.prototype );
	API_ADD.prototype.requestSql = function( paramClass ){
		// 対象のログデータをSQLへ要求
		var outJsonData = this._outJsonData;
		var config = factoryImpl.CONFIG_SQL.getInstance();
	    var addActivityLog2Database = factoryImpl.sql_parts.getInstance().addActivityLog2Database;

		return new Promise(function(resolve,reject){
			addActivityLog2Database(
				config.database, 
				param.getDeviceKey(), 
				param.getBatteryValue() 
			).then(function(resultInsert){
				// 「インサート」処理が成功
				// 【FixME】総登録数（対象のデバイスについて）を取得してjsonに含めて返す。取れなければ null でOK（その場合も成功扱い）。
				var param = new API_PARAM(resultInsert);
				outJsonData[ "result" ] = "Success to insert " + param.getBatteryValue() + " as batterylog on Database!";
				outJsonData[ "device_key"] = param.getDeviceKey();
				resolve();
			}).catch(function(err){
				// 「インサート」処理で失敗。
				outJsonData[ "error_on_insert" ];
				reject( err ); // ⇒次のcatch()が呼ばれる。
			});
		});
	};
	var subInstance = new API_ADD();
	var getShowObjectFromGetData = factoryImpl.sql_parts.getInstance().getInsertObjectFromPostData;
	var inputData = getInsertObjectFromPostData( dataFromPost );
	return subInstance.run( inputData );
};










  