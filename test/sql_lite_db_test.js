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



// var createPromiseForSqlConnection = function( outJsonData, inputDataObj, sqlConfig ){
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
    before( function(){
        // ORIGINAL[ "mssql" ] = sql_parts.factoryImpl.mssql.getInstance();

        // mssal はフックしない。バックアップして戻すだけ。
    });
    after( function(){
        // sql_parts.factoryImpl.mssql.setStub( ORIGINAL.mssql );
    });
    

    describe( "::createPromiseForSqlConnection()",function(){
        it("正常系");
/*
        it("正常系",function(){
            var outJsonData = {};
            var inputDataObj = {};
            var sqlConfig = {};
            var stubs = createAndHookStubs4Mssql( sql_parts );

            stubs.connect.onCall(0).returns( Promise.resolve() );
            return shouldFulfilled(
                sql_parts.createPromiseForSqlConnection( outJsonData, inputDataObj, sqlConfig )
            ).then(function( result ){
                assert( stubs.connect.calledOnce );
                expect( stubs.connect.getCall(0).args[0] ).to.equal( sqlConfig );
                expect( outJsonData.result ).to.be.exist;
                expect( result ).to.equal( inputDataObj );
            });
        });
        it("異常系：SQL接続がエラー", function(){
            var outJsonData = {};
            var inputDataObj = {};
            var sqlConfig = {};
            var EXPECTED_ERROR= {};
            var stubs = createAndHookStubs4Mssql( sql_parts );
            
            stubs.connect.onCall(0).returns( Promise.reject( EXPECTED_ERROR ) );
            return shouldRejected(
                sql_parts.createPromiseForSqlConnection( outJsonData, inputDataObj, sqlConfig )
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


    describe("::SQLiteトライアル", function(){
		it("シークエンス調査", function(){
            var outJsonData = {};
            var inputDataObj = {};
            var sqlConfig = { "database" : "./db/mydb.sqlite3" }; // npm test 実行フォルダ、からの相対パス
//            sqlConfig = { "database" : "./db/test.splite3" }
             
            var queryFromGet = { "device_key" : "ほげふがぴよ" };
            var dataFromPost = null;
            var promise;
            this.timeout(5000);

            promise = createPromiseForSqlConnection( outJsonData, inputDataObj, sqlConfig );
/*
            promise = promise.then( function(result){
                return sql_parts.setupTable1st( sqlConfig.database );
            });
*/
/*
[ { type: 'table',
    name: 'activitylogs',
    tbl_name: 'activitylogs',
    rootpage: 2,
    sql: 'CREATE TABLE activitylogs([id] [integer] PRIMARY KEY AUTOINCREMENT NOT NULL, [created_at] [datetime] NOT NULL, [type] [int] NULL, [owners_hash] [char](64) NULL )' },
  { type: 'table',
    name: 'sqlite_sequence',
    tbl_name: 'sqlite_sequence',
    rootpage: 3,
    sql: 'CREATE TABLE sqlite_sequence(name,seq)' },
  { type: 'table',
    name: 'owners_permission',
    tbl_name: 'owners_permission',
    rootpage: 4,
    sql: 'CREATE TABLE owners_permission([id] [integer] PRIMARY KEY AUTOINCREMENT NOT NULL, [owners_hash] [char](64) NOT NULL, [password] [char](16) NULL, [max_entrys] [int] NOT NULL, UNIQUE ([owners_hash]))' } ]
*/
/*
[ { type: 'table',
    name: 'activitylogs',
    tbl_name: 'activitylogs',
    rootpage: 2,
    sql: 'CREATE TABLE activitylogs([id] [integer] PRIMARY KEY AUTOINCREMENT NOT NULL, [created_at] [datetime] NOT NULL, [ty
pe] [int] NULL, [owners_hash] [char](64) NULL )' },
  { type: 'table',
    name: 'sqlite_sequence',
    tbl_name: 'sqlite_sequence',
    rootpage: 3,
    sql: 'CREATE TABLE sqlite_sequence(name,seq)' },
  { type: 'table',
    name: 'owners_permission',
    tbl_name: 'owners_permission',
    rootpage: 4,
    sql: 'CREATE TABLE owners_permission([id] [integer] PRIMARY KEY AUTOINCREMENT NOT NULL, [owners_hash] [char](64) NOT NUL
L, [password] [char](16) NULL, [max_entrys] [int] NOT NULL, UNIQUE ([owners_hash]))' } ]
*/

            promise = promise.then( function(result){
                return getNumberOfUsers( sqlConfig.database );
            });
/*
            promise = promise.then( function(result){
                return addNewUser( sqlConfig.database, "nyan1nyan2nyan3nayn4nayn5nyan6ny", 1024, "password" );
            });

            promise = promise.then( function(result){
                return getListOfActivityLogWhereDeviceKey( sqlConfig.database, "nyan1nyan2nyan3nayn4nayn5nyan6ny", null );
            });

            promise = promise.then(function( result ){
                return isOwnerValid( sqlConfig.database, "nyan1nyan2nyan3nayn4nayn5nyan6ny" );
            }).then(function( maxCount ){
				console.log( "[maxCount]" + maxCount );
                // expect( maxCount, "記録エントリーの最大個数を返却すること" ).to.be.exist;
                return addActivityLog2Database( sqlConfig.database, "nyan1nyan2nyan3nayn4nayn5nyan6ny", 90 );
            });
*/
            return shouldFulfilled(
                promise
			).then(function( result ){
                console.log( result );
                closeConnection( sqlConfig.database );
			});
		});
	});
});

