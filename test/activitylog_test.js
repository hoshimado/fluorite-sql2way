/*
	[activitylog_test.js]

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

const activitylog = require("../src/api/activitylog.js");

var TEST_CONFIG_SQL = { // テスト用
	user : "fake_user",
	password : "fake_password",
	server : "fake_server_url", // You can use 'localhost\\instance' to connect to named instance
	database : "fake_db_name",
	stream : false,  // if true, query.promise() is NOT work! // You can enable streaming globally

	// Use this if you're on Windows Azure
	options : {
		encrypt : true 
	} // It works well on LOCAL SQL Server if this option is set.
};


describe( "activitylog.js", function(){

    var COMMON_STUB_MANAGER = new ApiCommon_StubAndHooker(function(){
        return {
            "CONFIG_SQL" : TEST_CONFIG_SQL, 
            "sql_parts" : {
                "createPromiseForSqlConnection" : sinon.stub(),
                "closeConnection" : sinon.stub(),
                "isOwnerValid" : sinon.stub(),
                "isDeviceAccessRateValied" : sinon.stub(),
                "getInsertObjectFromPostData" : sinon.stub(),
                "addActivityLog2Database" : sinon.stub(),
                "getShowObjectFromGetData" : sinon.stub(),
                "getListOfActivityLogWhereDeviceKey" : sinon.stub(),
                "getDeleteObjectFromGetData" : sinon.stub(), 
                "deleteActivityLogWhereDeviceKey" : sinon.stub()
            }
        };
    });
    
    /**
     * @description writeJsonAsString() のスタブ生成
     */
    function StubResponse(){
        this.writeJsonAsString = sinon.stub();
    };

    var setupAnomalyFormatTest = function( stubs ){ // ※「Abnormal」では無い。
        var EXPECTED_INPUT_DATA = { "owner_hash" : "があっても、", "invalid" : "が在ったら「不正データ」と判断されたを意味する。" };

        // 【ToDo】↓ここはspyで良いのかもしれないが、、、上手く実装できなかったのでstubで。stubで悪いわけではない。
        stubs.sql_parts.getShowObjectFromGetData.onCall(0).returns( EXPECTED_INPUT_DATA );

        // beforeEach()で準備される stub に対して、動作を定義する。
        stubs.sql_parts.createPromiseForSqlConnection.onCall(0).returns(
            Promise.reject()
        );
        stubs.sql_parts.closeConnection.onCall(0).returns(
            Promise.reject()
        );

        return {
            "queryFromGet" : {
                "mac_address" : "はADDは許可。ShowやDeleteは禁止。いずれにせよ、なんらかのフォーマットエラーを想定"
            },
            "dataFromPost" : null,
            "EXPECTED_INPUT_DATA" : EXPECTED_INPUT_DATA
        };
    };
    var verifyAnomalyFormatTest = function( result, stubs, param ){ // ※「Abnormal」では無い。
        var stubCreateConnection = stubs.sql_parts.createPromiseForSqlConnection;
        var stubList = stubs.sql_parts.getListOfActivityLogWhereDeviceKey;

        assert( stubs.sql_parts.getShowObjectFromGetData.calledOnce, "呼び出しパラメータの妥当性検証＆整形、が一度呼ばれること" );
        expect( stubs.sql_parts.getShowObjectFromGetData.getCall(0).args[0] ).to.equal(param.queryFromGet);

        assert( stubCreateConnection.notCalled, "SQLへの接続生成、が呼ばれないこと" );

        assert( stubs.sql_parts.isOwnerValid.notCalled, "アクセス元の認証、が呼ばれないこと" );
        
        assert( stubs.sql_parts.isDeviceAccessRateValied.notCalled, "アクセス頻度の認証、が呼ばれないこと" );

        assert( stubList.notCalled, "SQLへのログ取得クエリー、が呼ばれないこと。" );

        assert( stubs.mssql.close.notCalled, "【FixME】mssql.closeが、notConnectionでの呼ばれてしまうなぁ" );
        expect( result ).to.be.exist;
        // expect( stubWrite.getCall(0).args[0].table ).to.deep.equal( EXPECTED_RECORDSET );
        // httpステータス400が設定されること。
    };
    var setupSqlFailed500 = function( stubs ){
        // beforeEach()で準備される stub に対して、動作を定義する。
        stubs.sql_parts.createPromiseForSqlConnection.onCall(0).returns(
            Promise.reject( "SQL Connection failed." )
        );
    };
    /**
     * SQL接続エラーのテスト検証
     * @param {*} result 実行結果。
     * @param {*} stubs スタブまとめたもの。
     */
    var verifySqlFialed500 = function( result, stubs ){
        var stubCreateConnection = stubs.sql_parts.createPromiseForSqlConnection;

        assert( stubCreateConnection.calledOnce, "SQLへの接続生成、が一度呼ばれること" );
        assert( stubs.mssql.close.calledOnce, "MSSQL.close()が呼ばれること" );

        expect(result).to.be.exist;
        expect(result).to.have.property("status").and.equal(500);
    };
    var setupPermissionDeny401 = function( stubs, EXPECTED_INPUT_DATA ){
        // beforeEach()で準備される stub に対して、動作を定義する。
        stubs.sql_parts.createPromiseForSqlConnection.onCall(0).returns(
            Promise.resolve( EXPECTED_INPUT_DATA )
        );
        stubs.sql_parts.isOwnerValid.onCall(0).returns(
            Promise.reject("アクセス元が不正")
        );
    };
    var verifyPermissionDeny401 = function( result, stubs, EXPECTED_INPUT_DATA ){
        var stubCreateConnection = stubs.sql_parts.createPromiseForSqlConnection;

        assert( stubCreateConnection.calledOnce, "SQLへの接続生成、が一度呼ばれること" );

        assert( stubs.sql_parts.isOwnerValid.calledOnce, "アクセス元の認証、が一度呼ばれること" );
        expect( stubs.sql_parts.isOwnerValid.getCall(0).args[0] ).to.equal( TEST_CONFIG_SQL.database );
        expect( stubs.sql_parts.isOwnerValid.getCall(0).args[1] ).to.equal( EXPECTED_INPUT_DATA.device_key );
        
        assert( stubs.mssql.close.calledOnce, "MSSQL.close()が呼ばれること" );

        expect(result).to.be.exist;
        expect(result).to.have.property("status").and.equal(401);
    };
    var setupAccessRateDeny503 = function( stubs, EXPECTED_INPUT_DATA ){
        var EXPECTED_MAX_COUNT = 255;

        // beforeEach()で準備される stub に対して、動作を定義する。
        stubs.sql_parts.createPromiseForSqlConnection.onCall(0).returns(
            Promise.resolve( EXPECTED_INPUT_DATA )
        );
        stubs.sql_parts.isOwnerValid.onCall(0).returns(
            Promise.resolve( EXPECTED_MAX_COUNT )
        );
        stubs.sql_parts.isDeviceAccessRateValied.onCall(0).returns(
            Promise.reject({
                "item_count" : 256,
            })
        );
    };
    /**
     * アクセス頻度の検証エラー。
     * @param {*} result 
     * @param {*} stubs 
     */
    var verifyAccessRateDeny503 = function( result, stubs ){
        var stubCreateConnection = stubs.sql_parts.createPromiseForSqlConnection;
        // var isRateLimite = stubs.sql_parts.isDeviceAccessRateValied;

        assert( stubCreateConnection.calledOnce, "SQLへの接続生成、が一度呼ばれること" );

        assert( stubs.sql_parts.isOwnerValid.calledOnce, "アクセス元の認証、が一度呼ばれること" );
        
        // assert( isRateLimite.calledOnce, "アクセス頻度の認証、が一度呼ばれること" );

        assert( stubs.mssql.close.calledOnce, "MSSQL.close()が呼ばれること" );

        expect(result).to.be.exist;
        expect(result).to.have.property("status").and.equal(503);
    };


    describe("::api_vi_activitylog_setup()",function(){
        var original = {
            "key" : "",
            "database" : ""
        };
        /**
         * @type beforeEachで初期化される。
         */
        beforeEach(function(){ // 内部関数をフックする。
            original.key = activitylog.factoryImpl[ "SETUP_KEY" ].getInstance();
            activitylog.factoryImpl[ "SETUP_KEY" ].setStub( "fugafuga" );
            activitylog.factoryImpl[ "CONFIG_SQL" ].setStub( {"database" : "./db/mydb.sqlite3"} );
        });
        afterEach(function(){
            activitylog.factoryImpl[ "SETUP_KEY" ].setStub( original.key );
        });

        it("直テスト", function(){
            var queryFromGet = null;
            var dataFromPost = { "create_key" : "fugafuga" };
            var api_vi_activitylog_setup = activitylog.api_vi_activitylog_setup;

            return shouldFulfilled(
                api_vi_activitylog_setup( queryFromGet, dataFromPost )
            ).then(function( result ){
                console.log( result );
            });

        });
    });


    describe("::api_vi_activitylog_signup()",function(){
        var original = {
            "database" : ""
        };
        /**
         * @type beforeEachで初期化される。
         */
        beforeEach(function(){ // 内部関数をフックする。
            original.key = activitylog.factoryImpl[ "SETUP_KEY" ].getInstance();
            activitylog.factoryImpl[ "CONFIG_SQL" ].setStub( {"database" : "./db/mydb.sqlite3"} );
            activitylog.factoryImpl[ "MAX_USERS"].setStub( 5 );
        });
        afterEach(function(){
            activitylog.factoryImpl[ "SETUP_KEY" ].setStub( original.key );
        });

        it("直テスト", function(){
            var queryFromGet = null;
            var dataFromPost = { "username" : "nyan1nyan2nyan3nayn4nayn5nyan6ny" };
            var api_vi_activitylog_signup = activitylog.api_vi_activitylog_signup;

            return shouldFulfilled(
                api_vi_activitylog_signup( queryFromGet, dataFromPost )
            ).then(function( result ){
                console.log( result );
            });

        });
    });



    describe("::api_v1_activitylog_show()", function(){
        var stubs;
        var api_v1_activitylog_show = activitylog.api_v1_activitylog_show;

        /**
         * @type beforeEachで初期化される。
         */
        beforeEach(function(){ // 内部関数をフックする。
            stubs = COMMON_STUB_MANAGER.createStubs();

            COMMON_STUB_MANAGER.hookInstance( activitylog, stubs );
        });
        afterEach(function(){
            COMMON_STUB_MANAGER.restoreOriginal( activitylog );
        });

        // ここからテスト。
        it("正常系", function(){
            var queryFromGet = { "device_key" : "ほげふがぴよ" };
            var dataFromPost = null;
            var EXPECTED_INPUT_DATA = { 
                "device_key" : queryFromGet.device_key,
                "date_start" : "2017-02-01", // queryGetに無い場合でも、、デフォルトを生成する。
                "date_end"   : "2017-02-14"  // 上同。
            };
            var EXPECTED_RECORDSET = [
                {"created_at":"2017-02-08T00:47:25.000Z","battery":91},
                {"created_at":"2017-02-11T12:36:01.000Z","battery":77}
            ];
            var EXPECTED_MAX_COUNT = 255;

            // 【ToDo】↓ここはspyで良いのかもしれないが、、、上手く実装できなかったのでstubで。stubで悪いわけではない。
            stubs.sql_parts.getShowObjectFromGetData.onCall(0).returns( EXPECTED_INPUT_DATA );

            // beforeEach()で準備される stub に対して、動作を定義する。
            stubs.sql_parts.createPromiseForSqlConnection.onCall(0).returns(
                Promise.resolve( EXPECTED_INPUT_DATA )
            );
            stubs.sql_parts.closeConnection.onCall(0).returns(
                Promise.resolve()
            );
            stubs.sql_parts.isOwnerValid.onCall(0).returns(
                Promise.resolve( EXPECTED_MAX_COUNT )
            );
            stubs.sql_parts.isDeviceAccessRateValied.onCall(0).returns(
                Promise.resolve( EXPECTED_INPUT_DATA )
            );
            stubs.sql_parts.getListOfActivityLogWhereDeviceKey.onCall(0).returns(
                Promise.resolve( EXPECTED_RECORDSET )
            );

            return shouldFulfilled(
                api_v1_activitylog_show( queryFromGet, dataFromPost )
            ).then(function( result ){
                var stubCreateConnection = stubs.sql_parts.createPromiseForSqlConnection;
                // var isRateLimite = stubs.sql_parts.isDeviceAccessRateValied;
                var stubList = stubs.sql_parts.getListOfActivityLogWhereDeviceKey;

                assert( stubs.sql_parts.getShowObjectFromGetData.calledOnce, "呼び出しパラメータの妥当性検証＆整形、が一度呼ばれること" );
                expect( stubs.sql_parts.getShowObjectFromGetData.getCall(0).args[0] ).to.equal(queryFromGet);

                assert( stubCreateConnection.calledOnce, "SQLへの接続生成、が一度呼ばれること" );
                // expect( stubCreateConnection.getCall(0).args[0] ).to.be.an('object');
                // expect( stubCreateConnection.getCall(0).args[1] ).to.have.ownProperty('device_key');

                assert( stubs.sql_parts.isOwnerValid.calledOnce, "アクセス元の認証、が一度呼ばれること" );
                expect( stubs.sql_parts.isOwnerValid.getCall(0).args[0] ).to.equal( TEST_CONFIG_SQL.database );
                expect( stubs.sql_parts.isOwnerValid.getCall(0).args[1] ).to.equal( queryFromGet.device_key );
                
                /*
                assert( isRateLimite.calledOnce, "アクセス頻度の認証、が一度呼ばれること" );
                expect( isRateLimite.getCall(0).args[0] ).to.equal( TEST_CONFIG_SQL.database );
                expect( isRateLimite.getCall(0).args[1].getDeviceKey() ).to.equal( EXPECTED_INPUT_DATA.device_key );
                expect( isRateLimite.getCall(0).args[1].getBatteryValue() ).to.equal( EXPECTED_INPUT_DATA.battery_value );
                expect( isRateLimite.getCall(0).args[1].getMaxCount() ).to.equal( EXPECTED_MAX_COUNT );
                expect( isRateLimite.getCall(0).args[1].getStartDate() ).to.equal( EXPECTED_INPUT_DATA.date_start );
                expect( isRateLimite.getCall(0).args[1].getEndDate() ).to.equal( EXPECTED_INPUT_DATA.date_end );
                expect( isRateLimite.getCall(0).args[2] ).to.equal( 30, "1時間辺りのアクセス可能回数" );
                */
                // 引数に、、、「直前のアクセスからの経過時間」を入れるかは未定。

                assert( stubList.calledOnce, "SQLへのログ取得クエリー。getListOfActivityLogWhereDeviceKey()が1度呼ばれること。" );
                expect( stubList.getCall(0).args[0] ).to.equal( TEST_CONFIG_SQL.database );
                expect( stubList.getCall(0).args[1] ).to.equal( queryFromGet.device_key );
                expect( stubList.getCall(0).args[2] ).to.deep.equal({
                    "start" : EXPECTED_INPUT_DATA.date_start,
                    "end"   : EXPECTED_INPUT_DATA.date_end 
                });

                // 終了処理のテストは作成中。
                // assert( stubs.close.calledOnce, "MSSQL.close()が呼ばれること" );

                expect( result ).to.be.exist;
                expect( result.jsonData.table ).to.deep.equal( EXPECTED_RECORDSET );
                expect(result).to.have.property("status").and.equal(200);
            });
        });

/*
        // ◆異常系は、まとめてテスト（関数定義して、それをit()に渡す）べきか？
        it("異常系：要求パラメータのフォーマットGなら、400を返す", function(){
            var param = setupAbnormalFormatTest( stubs );
            
            return shouldFulfilled(
                api_v1_activitylog_show( param.queryFromGet, param.dataFromPost )
            ).then(function( result ){
                verifyAbnormalFormatTest( result, stubs, param );
            });

        } );

        it("異常系：SQL接続エラーNGなら、内部エラーなので500を返す",function(){
            var EXPECTED_INPUT_DATA = { 
                "device_key" : "ほげふがぴよ",
                "date_start" : "2017-02-01", // queryGetに無い場合でも、、デフォルトを生成する。
                "date_end"   : "2017-02-14"  // 上同。
            };

            setupSqlFailed500( stubs );
            stubs.sql_parts.getShowObjectFromGetData.onCall(0).returns( EXPECTED_INPUT_DATA );

            return shouldFulfilled( // 異常系も、最終リターンはresolveにしておく。→http応答するから。
                api_v1_activitylog_show( { "device_key" : EXPECTED_INPUT_DATA.device_key }, null )
            ).then(function( result ){
                verifySqlFialed500( result, stubs );
            });
        });
        it("異常系：認証NGなら、401を返す",function(){
            var EXPECTED_INPUT_DATA = { 
                "device_key" : "ほげふがぴよ",
                "date_start" : "2017-02-01", // queryGetに無い場合でも、、デフォルトを生成する。
                "date_end"   : "2017-02-14"  // 上同。
            };
            setupPermissionDeny401( stubs, EXPECTED_INPUT_DATA );
            stubs.sql_parts.getShowObjectFromGetData.onCall(0).returns( EXPECTED_INPUT_DATA );

            return shouldFulfilled(
                api_v1_activitylog_show( { "device_key" : EXPECTED_INPUT_DATA.device_key }, null )
            ).then(function( result ){
                verifyPermissionDeny401( result, stubs, EXPECTED_INPUT_DATA );
            });
        });
        // メモ⇒レートリミットはShowとaddで変更する。
        it("異常系：レートリミット違反なら（アクセス時間間隔）、503を返す",function(){
            var EXPECTED_INPUT_DATA = { 
                "device_key" : "ほげふがぴよ",
                "date_start" : "2017-02-01", // queryGetに無い場合でも、、デフォルトを生成する。
                "date_end"   : "2017-02-14"  // 上同。
            };
            setupAccessRateDeny503( stubs, EXPECTED_INPUT_DATA );
            stubs.sql_parts.getShowObjectFromGetData.onCall(0).returns( EXPECTED_INPUT_DATA );

            return shouldFulfilled(
                api_v1_activitylog_show( { "device_key" : EXPECTED_INPUT_DATA.device_key }, null )
            ).then(function( result ){
                verifyAccessRateDeny503( result, stubs );
            });
        });
        it("異常系：ログデータの取得エラーなら、内部エラー500を返す", function(){
            var queryFromGet = { "device_key" : "ほげふがぴよ" };
            var dataFromPost = null;
            var EXPECTED_INPUT_DATA = { 
                "device_key" : queryFromGet.device_key,
                "date_start" : "2017-02-01", // queryGetに無い場合でも、、デフォルトを生成する。
                "date_end"   : "2017-02-14"  // 上同。
            };
            var EXPECTED_RECORDSET = [
                {"created_at":"2017-02-08T00:47:25.000Z","battery":91},
                {"created_at":"2017-02-11T12:36:01.000Z","battery":77}
            ];
            var EXPECTED_MAX_COUNT = 255;

            // beforeEach()で準備される stub に対して、動作を定義する。
            stubs.sql_parts.getShowObjectFromGetData.onCall(0).returns( EXPECTED_INPUT_DATA );

            stubs.sql_parts.createPromiseForSqlConnection.onCall(0).returns(
                Promise.resolve( EXPECTED_INPUT_DATA )
            );
            stubs.sql_parts.isOwnerValid.onCall(0).returns(
                Promise.resolve( EXPECTED_MAX_COUNT )
            );
            stubs.sql_parts.isDeviceAccessRateValied.onCall(0).returns(
                Promise.resolve( EXPECTED_INPUT_DATA )
            );
            stubs.sql_parts.getListOfActivityLogWhereDeviceKey.onCall(0).returns(
                Promise.reject()
            );

            return shouldFulfilled(
                api_v1_activitylog_show( queryFromGet, dataFromPost )
            ).then(function( result ){
                var stubCreateConnection = stubs.sql_parts.createPromiseForSqlConnection;
                // var isRateLimite = stubs.sql_parts.isDeviceAccessRateValied;
                var stubList = stubs.sql_parts.getListOfActivityLogWhereDeviceKey;

                assert( stubCreateConnection.calledOnce, "SQLへの接続生成、が一度呼ばれること" );

                assert( stubs.sql_parts.isOwnerValid.calledOnce, "アクセス元の認証、が一度呼ばれること" );

                // assert( isRateLimite.calledOnce, "アクセス頻度の認証、が一度呼ばれること" );

                assert( stubList.calledOnce, "SQLへのログ取得クエリー。getListOfActivityLogWhereDeviceKey()が1度呼ばれること。" );

                assert( stubs.mssql.close.calledOnce, "MSSQL.close()が呼ばれること" );

                expect(result).to.be.exist;
                expect(result).to.have.property("status").and.equal(500);
            });
        });
*/
    });

    describe("::api_vi_activitylog_add()",function(){
        var original = {
            "database" : ""
        };
        /**
         * @type beforeEachで初期化される。
         */
        beforeEach(function(){ // 内部関数をフックする。
            original.key = activitylog.factoryImpl[ "SETUP_KEY" ].getInstance();
            activitylog.factoryImpl[ "CONFIG_SQL" ].setStub( {"database" : "./db/mydb.sqlite3"} );
        });
        afterEach(function(){
            activitylog.factoryImpl[ "CONFIG_SQL" ].setStub( {"database" : ""} );
        });

        it("正常系");

    });

});
/*
    参照先Webページメモ
    http://chaijs.com/api/bdd/
    http://sinonjs.org/docs/
    http://qiita.com/xingyanhuan/items/da9f814ce4bdf8f80fa1
    http://azu.github.io/promises-book/#basic-tests
*/






