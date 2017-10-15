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
var ApiCommon_StubAndHooker = require("./support_stubhooker.js").ApiCommon_StubAndHooker;

const sql_parts = require("../src/api/sql_lite_db.js");

var TEST_CONFIG_SQL = { // テスト用
	user : "fake_user",
	password : "fake_password",
	server : "fake_server_url", // You can use 'localhost\\instance' to connect to named instance
	database : "./db/mydb.splite3",  //"fake_db_name",
	stream : false,  // if true, query.promise() is NOT work! // You can enable streaming globally

	// Use this if you're on Windows Azure
	options : {
		encrypt : true 
	} // It works well on LOCAL SQL Server if this option is set.
};



// var createPromiseForSqlConnection = function( sqlConfig ){
// var isOwnerValid = function( databaseName, deviceKey ){
// exports.closeConnection = closeConnection;

describe( "sql_lite_db_test.js", function(){
    var createPromiseForSqlConnection = sql_parts.createPromiseForSqlConnection;
    var isOwnerValid = sql_parts.isOwnerValid;
    var closeConnection = sql_parts.closeConnection;
    var addActivityLog2Database = sql_parts.addActivityLog2Database;
    var getListOfActivityLogWhereDeviceKey = sql_parts.getListOfActivityLogWhereDeviceKey;
    var addNewUser = sql_parts.addNewUser;
    var getNumberOfUsers = sql_parts.getNumberOfUsers;

    /**
     * @type 各テストからはアクセス（ReadOnly）しない定数扱いの共通変数。
     */
    var ORIGINAL = {};
    var sqlConfig = { "database" : "だみ～.sqlite3" };
    var stubInstance, databaseArgs1;
    beforeEach( function(){
        ORIGINAL[ "sqlite3" ] = sql_parts.factoryImpl.sqlite3.getInstance();
        ORIGINAL[ "dbs" ] = sql_parts.factoryImpl.db.getInstance();
    });
    afterEach( function(){
        sql_parts.factoryImpl.sqlite3.setStub( ORIGINAL.sqlite3 );
        sql_parts.factoryImpl.db.setStub( ORIGINAL.dbs );
    });
    

    describe( "::createPromiseForSqlConnection()",function(){
        beforeEach( function(){
            var stubSqlite3 = { 
                "verbose" : sinon.stub() 
            };
            stubInstance = { "sqlite3" : "fake"}; // newで返すオブジェクトのモック。
            databaseArgs1 = "";
    
            // sqlite3モジュールに対するI/Oをモックに差し替える。
            stubSqlite3.verbose.onCall(0).returns({
                "Database" : function( databaseName, callback ){
                    // newされた時のコンスタラクタ処理に相当。
                    // returnすることで差替えることが出来る。
                    setTimeout(function() {
                        callback(); // 非同期で呼ばれる、、、を疑似的に行う。
                    }, 100);
                    databaseArgs1 = databaseName;
                    return stubInstance;
                }
            });
            sql_parts.factoryImpl.sqlite3.setStub( stubSqlite3 );
        });
    
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
/*
        it("異常系：SQL接続がエラー", function(){
            var outJsonData = {};
            var inputDataObj = {};
            var sqlConfig = {};
            var EXPECTED_ERROR= {};
            var stubs = createAndHookStubs4Mssql( sql_parts );
            
            stubs.connect.onCall(0).returns( Promise.reject( EXPECTED_ERROR ) );
            return shouldRejected(
                sql_parts.createPromiseForSqlConnection( sqlConfig )
            ).catch(function(){
                assert( stubs.connect.calledOnce );
                expect( stubs.connect.getCall(0).args[0] ).to.equal( sqlConfig );
                expect( outJsonData.result ).to.not.be.exist;
            });
        });
//*/
    });
    describe( "::isOwnerValid()", function(){
        var isOwnerValid = sql_parts.isOwnerValid;
        it("正常系");
/*
        it(" finds VALID hash.", function(){
            var stubs = createAndHookStubs4Mssql( sql_parts );
            var expected_recordset = [
                { "owners_hash" : "ほげ", 
                  "max_entrys"  : 127
                }
            ];
            var stub_query = stubs.Request_query;

            stub_query.onCall(0).returns( Promise.resolve( expected_recordset ) );

            return shouldFulfilled(
                isOwnerValid( TEST_DATABASE_NAME, expected_recordset[0].owners_hash )
            ).then( function( maxCount ){
                var query_str = stub_query.getCall(0).args[0];
                var expected_str = "SELECT owners_hash, max_entrys FROM [";
                expected_str += TEST_DATABASE_NAME + "].dbo.owners_permission WHERE [owners_hash]='";
                expected_str += expected_recordset[0].owners_hash + "'";

                assert( stub_query.calledOnce );
                expect( query_str ).to.be.equal( 
                    expected_str
                );
                expect( maxCount, "記録エントリーの最大個数を返却すること" ).to.be.exist;
            });
        });
        it(" dont finds VALID hash: WHERE command returns 0 array.", function(){
            var stubs = createAndHookStubs4Mssql( sql_parts );
            var stub_query = stubs.Request_query;
            var expected_recordset = [];

            stub_query.onCall(0).returns( Promise.resolve( expected_recordset ) );

            return shouldRejected(
                isOwnerValid( TEST_DATABASE_NAME, "fuga" )
            ).catch( function( err ){
                assert( err, "エラー引数が渡されること" );
            });
        });
//*/
    });
    describe( "::getListOfActivityLogWhereDeviceKey()",function(){
        it("正常系。期間指定なし。",function(){
            var period = null; //無しの場合
            var deviceKey = "にゃーん。";
            var dbs = sql_parts.factoryImpl.db.getInstance();
            var expected_rows = [
                { "created_at": '2017-10-22 23:59:00.000', "type": 900 }
            ];
            var stub_instance = sinon.stub();
            var stub_wrapperStr = sinon.stub()
            .callsFake( function(str){ return str; } );

            dbs[ sqlConfig.database ] = {
                "all" : stub_instance
            };
            stub_instance.callsArgWith(2, null, expected_rows);

            sql_parts.factoryImpl._wrapStringValue.setStub( stub_wrapperStr );


            return shouldFulfilled(
                sql_parts.getListOfActivityLogWhereDeviceKey( sqlConfig.database, deviceKey, period )
            ).then(function(result){
                assert( stub_wrapperStr.withArgs( deviceKey ).calledOnce );
                assert( stub_instance.calledOnce );
                var called_args = stub_instance.getCall(0).args;
                expect( called_args[0] ).to.equal(
                    "SELECT created_at, type FROM activitylogs " 
                    + "WHERE [owners_hash]=\'" + deviceKey + "\'"
                );
                expect( called_args[1].length ).to.equal( 0 );
                expect( result ).to.deep.equal( expected_rows );
            });
        });
    });
    describe( "::closeConnection()",function(){
        it("正常系。期間指定なし。",function(){
            var period = null; //無しの場合
            var deviceKey = "にゃーん。";
            var dbs = sql_parts.factoryImpl.db.getInstance();
            var stub_instance = sinon.stub();

            dbs[ sqlConfig.database ] = {
                "close" : stub_instance
            };
            stub_instance.callsArgWith(0, null);
            return shouldFulfilled(
                sql_parts.closeConnection( sqlConfig.database )
            ).then(function(result){
                assert( stub_instance.calledOnce );
                expect( dbs[ sqlConfig.database ] ).to.not.be.exist;
            });
            
        });
    });
    //describe( "::addActivityLog2Database()",function(){
    //    it("正常系");
    //});
    //clock = sinon.useFakeTimers(); // これで時間が止まる。「1970-01-01 09:00:00.000」に固定される。
    // clock.restore(); // 時間停止解除。

});

