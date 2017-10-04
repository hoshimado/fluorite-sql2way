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

const sql_parts = require("../src/sql_lite_db.js");


describe( "sql_lite_db_test.js", function(){
    var createPromiseForSqlConnection = sql_parts.createPromiseForSqlConnection;
    var closeConnection = sql_parts.closeConnection;
    var addActivityLog2Database = sql_parts.addActivityLog2Database;
    var getListOfActivityLogWhereDeviceKey = sql_parts.getListOfActivityLogWhereDeviceKey;

    /**
     * @type 各テストからはアクセス（ReadOnly）しない定数扱いの共通変数。
     */
    var ORIGINAL = {};
    before( function(){
        // 今回は不要
    });
    after( function(){
        // 今回は不要
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

    describe("::SQLiteトライアル", function(){
		it("シークエンス調査", function(){
            var sqlConfig = { "database" : "./db/mydb.sqlite3" }; // npm test 実行フォルダ、からの相対パス
             
            var queryFromGet = { "device_key" : "ほげふがぴよ" };
            var dataFromPost = null;
            var promise;
            this.timeout(5000);

            promise = createPromiseForSqlConnection( sqlConfig );
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

