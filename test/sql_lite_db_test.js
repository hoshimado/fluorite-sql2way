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

const api_sql = require("../src/ztrial/sql_lite_db.js");

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

describe( "sql_lite_db_test.js::SQLiteトライアル", function(){
    var createPromiseForSqlConnection = api_sql.createPromiseForSqlConnection;
    var isOwnerValid = api_sql.isOwnerValid;
    var closeConnection = api_sql.closeConnection;
    var addActivityLog2Database = api_sql.addActivityLog2Database;
    var getListOfActivityLogWhereDeviceKey = api_sql.getListOfActivityLogWhereDeviceKey;
    
    describe("::シークエンス調査", function(){
		it("とりあえずテスト", function(){
            var outJsonData = {};
            var inputDataObj = {};
            var sqlConfig = { "database" : "./db/mydb.sqlite3" }; // npm test 実行フォルダ、からの相対パス

            var queryFromGet = { "device_key" : "ほげふがぴよ" };
            var dataFromPost = null;
            var promise;
            this.timeout(5000);

            promise = createPromiseForSqlConnection( outJsonData, inputDataObj, sqlConfig );

            promise = promise.then( function(result){
                return getListOfActivityLogWhereDeviceKey( sqlConfig.database, "nyan1nyan2nyan3nayn4nayn5nyan6ny", null );
            });
/*
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

