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




var API_V1_BASE = function(){
	this._outJsonData = {};
};
API_V1_BASE.prototype.isOwnerValid = function( inputData ){
	// 接続元の認証Y/Nを検証。
	var outJsonData = this._outJsonData;
	var paramClass = new API_PARAM( inputData );

	return new Promise(function(resolve,reject){
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
	var outJsonData = this._outJsonData;
	// paramClass =>
	// API_PARAM.prototype.getDeviceKey = function(){ return isDefined( this, "device_key"); };
	// API_PARAM.prototype.getTypeValue = function(){ return isDefined( this, "type_value"); };
	// API_PARAM.prototype.getStartDate = function(){ return isDefined( this, "date_start"); };
	// API_PARAM.prototype.getEndDate   = function(){ return isDefined( this, "date_end"); };
	// API_PARAM.prototype.getMaxCount = function(){ return isDefined( this, "max_count"); };
};
API_V1_BASE.prototype.closeNormal = function(){};
API_V1_BASE.prototype.closeAnomaly = function(){};
API_V1_BASE.prototype.run = function( inputData ){ // getほげほげObjectFromGetData( queryFromGet );済み。
	var outJsonData = this._outJsonData;
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
	).then(function( inputData ){
		return this.isOwnerValid( inputData );
  }).then(function( paramClass ){
		// this.isAccessRateValied()
		return Promise.resolve( paramClass );
  }).then(function( paramClass ){
		return this.requestSql( paramClass );
	});
};
var activitylog_show = function( queryFromGet, dataFromPost ){
	var API_SHOW = function(){
		var self = this;
		// API_V1_BASE.call( this, constaractParam ); // 継承元のコンスタラクタを明示的に呼び出す。
	};
	API_SHOW.prototype = Object.create( API_V1_BASE.prototype );
	API_SHOW.prototype.requestSql = function( paramClass ){
		// 対象のログデータをSQLへ要求
		var param = new API_PARAM( inputData );
		var config = factoryImpl.CONFIG_SQL.getInstance();
    var getListOfActivityLogWhereDeviceKey = factoryImpl.sql_parts.getInstance().getListOfActivityLogWhereDeviceKey;

		return new Promise(function(resolve,reject){
			getListOfActivityLogWhereDeviceKey(
				config.database, 
				param.getDeviceKey(), 
				{ 
					"start" : param.getStartDate(), 
					"end"   : param.getEndDate()
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
};



/**
 * バッテリーログをSQLから、指定されたデバイス（のハッシュ値）のものを取得する。
 */
exports.api_v1_activitylog_show = function( queryFromGet, dataFromPost ){
  // 接続要求のデータフォーマットを検証＆SQL接続を生成
  var createPromiseForSqlConnection = factoryImpl.sql_parts.getInstance().createPromiseForSqlConnection;
  var getShowObjectFromGetData = factoryImpl.sql_parts.getInstance().getShowObjectFromGetData;
	var outJsonData = {};
	var inputData = getShowObjectFromGetData( queryFromGet );


	// メモ2017.3.6
	// コード共通化はクラス継承で実現すればよい。【後で】
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
	).then(function( inputData ){
		// 接続元の認証Y/Nを検証。
		var param = new API_PARAM( inputData );

    return new Promise(function(resolve,reject){
			var config = factoryImpl.CONFIG_SQL.getInstance();
			var isOwnerValid = factoryImpl.sql_parts.getInstance( "isOwnerValid" );
      var is_onwer_valid_promise = isOwnerValid( 
				config.database, 
				param.getDeviceKey() 
			);
      is_onwer_valid_promise.then(function( maxCount ){
				resolve({ 
					"device_key" : param.getDeviceKey(), 
					"date_start" : param.getStartDate(),
					"date_end" : param.getEndDate(),
					"max_count" : maxCount 
				}); // ⇒次のthen()が呼ばれる。
			}).catch(function(err){
				if( err ){
					outJsonData[ "errer_on_validation" ] = err;
				}
				reject({
					"http_status" : 401 // Unauthorized
				}); // ⇒次のcatch()が呼ばれる。
			});
		});
  })
  /*
  .then(function( permittedInfomation ){
		// 接続元の接続レート（頻度）の許可／不許可を検証
		var param = new API_PARAM( permittedInfomation );
		var isDeviceAccessRateValied = factoryImpl.sql_parts.getInstance("isDeviceAccessRateValied");
		var config = factoryImpl.CONFIG_SQL.getInstance();
		var limit = factoryImpl.RATE_LIMIT.getInstance();

		return new Promise(function(resolve,reject){
			isDeviceAccessRateValied( 
				config.database, 
				param,
				limit.TIMES_PER_HOUR
			).then(function(result){
				resolve(result);
			}).catch(function(err){
				// アクセス上限エラー。
				reject({
					"http_status" : 503 // Service Unavailable 過負荷
				}); // ⇒次のcatch()が呼ばれる。
			});
		});
  })
  */
  .then(function( inputData ){
		// 対象のログデータをSQLへ要求
		var param = new API_PARAM( inputData );
		var config = factoryImpl.CONFIG_SQL.getInstance();
    var getListOfActivityLogWhereDeviceKey = factoryImpl.sql_parts.getInstance().getListOfActivityLogWhereDeviceKey;

		return new Promise(function(resolve,reject){
			getListOfActivityLogWhereDeviceKey(
				config.database, 
				param.getDeviceKey(), 
				{ 
					"start" : param.getStartDate(), 
					"end"   : param.getEndDate()
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
	}).then(function(){
    // ここまですべて正常終了
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
	}).catch(function(err){
        // どこかでエラーした⇒エラー応答のjson返す。
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
  });
};








  