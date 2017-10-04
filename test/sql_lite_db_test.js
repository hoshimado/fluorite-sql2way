/*
    [sql_lite_db_test.js]

    encoding=utf-8
*/

var chai = require("chai");
var assert = chai.assert;
var expect = chai.expect;
var sinon = require("sinon");
var shouldFulfilled = require("promise-test-helper").shouldFulfilled;
var shouldRejected  = require("promise-test-helper").shouldRejected;
require('date-utils');

var sql_parts = require("../src/sql_lite_db.js");


describe( "sql_lite_db_test.js", function(){
    var createPromiseForSqlConnection = sql_parts.createPromiseForSqlConnection;
    var closeConnection = sql_parts.closeConnection;
    var addActivityLog2Database = sql_parts.addActivityLog2Database;
    var getListOfActivityLogWhereDeviceKey = sql_parts.getListOfActivityLogWhereDeviceKey;

    /**
     * @type 各テストからはアクセス（ReadOnly）しない定数扱いの共通変数。
     */
    var ORIGINAL = {};
    var sqlConfig = { "database" : "dummy.sqlite3" };
    var stubInstance, databaseArgs1;
    before( function(){
        var stubSqlite3 = { 
            "verbose" : sinon.stub() 
        };
        stubInstance = { "sqlite3" : "fake"}; // newで返すオブジェクトのモック。
        databaseArgs1 = "";

        // sqlite3モジュールに対するI/Oをモックに差し替える。
        stubSqlite3.verbose.onCall(0).returns({
            "Database" : function( databaseName, callback ){ // 「newされる」ので、returnしておけば差替えれる。
                // newされた時のコンスタラクタ処理に相当。
                setTimeout(function() {
                    callback(); // 非同期で呼ばれる、、、を疑似的に行う。
                }, 100);
                databaseArgs1 = databaseName;
                return stubInstance;
            }
        });
        ORIGINAL[ "sqlite3" ] = sql_parts.factoryImpl.sqlite3.getInstance();
        sql_parts.factoryImpl.sqlite3.setStub( stubSqlite3 );


    });
    after( function(){
        sql_parts.factoryImpl.sqlite3.setStub( ORIGINAL.sqlite3 );
    });

    describe( "::createPromiseForSqlConnection()",function(){
        it("正常系",function(){
            var dbs = sql_parts.factoryImpl.db.getInstance();
            
            expect( dbs[ sqlConfig.database ] ).to.not.exist;
            return shouldFulfilled(
                sql_parts.createPromiseForSqlConnection( sqlConfig )
            ).then(function(){
                expect( databaseArgs1 ).to.equal( sqlConfig.database );
                expect( dbs[ sqlConfig.database ] ).to.equal( stubInstance );
            });
        });
        it("異常系：SQL接続がエラー");
    });
    describe( "::getListOfActivityLogWhereDeviceKey()",function(){
        it("正常系");
/*
var getListOfActivityLogWhereDeviceKey = function( databaseName, deviceKey, period ){
	var dbs = factoryImpl.db.getInstance();
	var db = dbs[ databaseName ];
	if( !db ){
		return Promise.reject({
			"isReady" : false
		});
	}

	var query_str = "SELECT created_at, type FROM activitylogs";
	query_str += " WHERE [owners_hash]='" + _wrapDeviceKey(deviceKey) + "'";
	if( period && period.start ){
		query_str += " AND [created_at] > '";
		query_str += period.start;
		query_str += "'";
	}
	if( period && period.end ){
		query_str += " AND [created_at] <= '";
		query_str += period.end;
		query_str += " 23:59'";
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
*/
});
    describe( "::addActivityLog2Database()",function(){
        it("正常系");
    });

    //clock = sinon.useFakeTimers(); // これで時間が止まる。「1970-01-01 09:00:00.000」に固定される。
    // clock.restore(); // 時間停止解除。

});

