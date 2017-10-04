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
        it("正常系",function(){
            var sqlConfig = { "database" : "dummy.sqlite3" };
            var stub_sqlite3 = { 
                "verbose" : sinon.mock() 
            };
            var stub_instance = { "sqlite3" : "fake"}; // newで返すオブジェクトのモック。
            var argv1 = "";

            // sqlite3モジュールに対するI/Oをモックに差し替える。
            stub_sqlite3.verbose.onCall(0).returns({
                "Database" : function( databaseName, callback ){ // 「newされる」ので、returnしておけば差替えれる。
                    // newされた時のコンスタラクタ処理に相当。
                    setTimeout(function() {
                        callback(); // 非同期で呼ばれる、、、を疑似的に行う。
                    }, 100);
                    argv1 = databaseName;
                    return stub_instance;
                }
            });
            sql_parts.factoryImpl.sqlite3.setStub( stub_sqlite3 );

            return shouldFulfilled(
                sql_parts.createPromiseForSqlConnection( sqlConfig )
            ).then(function(){
                var dbs = sql_parts.factoryImpl.db.getInstance();

                expect( argv1 ).to.equal( sqlConfig.database );
                expect( dbs[ argv1 ] ).to.equal( stub_instance );
            });
        });
        it("異常系：SQL接続がエラー");
    });
});

