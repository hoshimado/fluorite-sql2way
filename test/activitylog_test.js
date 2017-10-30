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
	database : "fake_db_name.sqlite3"
};


describe( "activitylog.js", function(){

    var COMMON_STUB_MANAGER = new ApiCommon_StubAndHooker(function(){
        return {
            "CONFIG_SQL" : TEST_CONFIG_SQL, 
            "sql_parts" : {
                "createPromiseForSqlConnection" : sinon.stub(),
                "closeConnection" : sinon.stub(),
                "isOwnerValid" : sinon.stub(),
                "getNumberOfUsers" : sinon.stub(),
                "setupTable1st" : sinon.stub(),
                "addNewUser" : sinon.stub(),
                "getInsertObjectFromPostData" : sinon.stub(),
                "getShowObjectFromGetData" : sinon.stub(),
                "getDeleteObjectFromGetData" : sinon.stub(), 
                "addActivityLog2Database" : sinon.stub(),
                "getListOfActivityLogWhereDeviceKey" : sinon.stub(),
                "deleteActivityLogWhereDeviceKey" : sinon.stub()
            }
        };
    });
    

    describe("::api_vi_activitylog_setup()",function(){
        var stubs, original = {};
        beforeEach(function(){ // 内部関数をフックする。
            original["SETUP_KEY"] = activitylog.factoryImpl.SETUP_KEY.getInstance(); 
            stubs = COMMON_STUB_MANAGER.createStubs();

            COMMON_STUB_MANAGER.hookInstance( activitylog, stubs );
        });
        afterEach(function(){
            COMMON_STUB_MANAGER.restoreOriginal( activitylog );
            activitylog.factoryImpl.SETUP_KEY.setStub( original.SETUP_KEY );
        });

        it("正常系", function(){
            var queryFromGet = null;
            var dataFromPost = { "create_key" : "せっとあっぷきー" };
            var EXPECTED_NEW_TABLE = { "hoge" : "fuga" };
            var api_vi_activitylog_setup = activitylog.api_vi_activitylog_setup;

            activitylog.factoryImpl.SETUP_KEY.setStub( dataFromPost.create_key );
            stubs.sql_parts.createPromiseForSqlConnection.onCall(0).returns(
                Promise.resolve()
            );
            stubs.sql_parts.setupTable1st.withArgs( TEST_CONFIG_SQL.database ).returns(
                Promise.resolve( EXPECTED_NEW_TABLE )
            );
            stubs.sql_parts.closeConnection.withArgs( TEST_CONFIG_SQL.database ).returns(
                Promise.resolve()
            );

            return shouldFulfilled(
                api_vi_activitylog_setup( queryFromGet, dataFromPost )
            ).then(function( result ){
                assert( stubs.sql_parts.createPromiseForSqlConnection.calledOnce );
                assert( stubs.sql_parts.setupTable1st.calledOnce );
                assert( stubs.sql_parts.closeConnection.calledOnce );
                expect( result ).to.have.property( "jsonData" );
                expect( result.jsonData ).to.have.property( "tables" );
                expect( result.jsonData.tables ).to.deep.equal( EXPECTED_NEW_TABLE );
                expect( result ).to.have.property( "status" ).to.equal( 200 );
            });
        });
        it("異常系：テーブル生成失敗の内部エラー", function(){
            var queryFromGet = null;
            var dataFromPost = { "create_key" : "せっとあっぷきー" };
            var EXPECTED_FAILED_OBJ = { "table" : "cant create." };
            var api_vi_activitylog_setup = activitylog.api_vi_activitylog_setup;
    
            activitylog.factoryImpl.SETUP_KEY.setStub( dataFromPost.create_key );
            stubs.sql_parts.createPromiseForSqlConnection.onCall(0).returns(
                Promise.resolve()
            );
            stubs.sql_parts.setupTable1st.withArgs( TEST_CONFIG_SQL.database ).returns(
                Promise.reject( EXPECTED_FAILED_OBJ )
            );
            stubs.sql_parts.closeConnection.withArgs( TEST_CONFIG_SQL.database ).returns(
                Promise.resolve()
            );
    
            return shouldFulfilled(
                api_vi_activitylog_setup( queryFromGet, dataFromPost )
            ).then(function( result ){
                assert( stubs.sql_parts.createPromiseForSqlConnection.calledOnce );
                assert( stubs.sql_parts.setupTable1st.calledOnce );
                assert( stubs.sql_parts.closeConnection.calledOnce );
                expect( result ).to.have.property( "jsonData" );
                expect( result.jsonData ).to.have.property( "setup_err" );
                expect( result.jsonData.setup_err ).to.deep.equal( EXPECTED_FAILED_OBJ );
                expect( result ).to.have.property( "status" ).to.equal( 500 );
            });
        });
        it("異常系：セットアップキーが不正", function(){
            var queryFromGet = null;
            var dataFromPost = { "create_key" : "不正なキー" };
            var EXPECTED_FAILED_OBJ = { "table" : "cant create." };
            var api_vi_activitylog_setup = activitylog.api_vi_activitylog_setup;
    
            activitylog.factoryImpl.SETUP_KEY.setStub( "期待キー" );

            return shouldFulfilled(
                api_vi_activitylog_setup( queryFromGet, dataFromPost )
            ).then(function( result ){
                assert( stubs.sql_parts.createPromiseForSqlConnection.notCalled );
                assert( stubs.sql_parts.setupTable1st.notCalled );
                assert( stubs.sql_parts.closeConnection.notCalled );
                expect( result ).to.have.property( "jsonData" );
                expect( result ).to.have.property( "status" ).to.equal( 403 );
            });
        });
    });

    describe("::api_vi_activitylog_signup()",function(){
        var stubs, original = {};
        beforeEach(function(){ // 内部関数をフックする。
            original["MAX_USERS"] = activitylog.factoryImpl.MAX_USERS.getInstance();
            stubs = COMMON_STUB_MANAGER.createStubs();

            COMMON_STUB_MANAGER.hookInstance( activitylog, stubs );
        });
        afterEach(function(){
            COMMON_STUB_MANAGER.restoreOriginal( activitylog );
            activitylog.factoryImpl.MAX_USERS.setStub( original.MAX_USERS );
        });

        it("正常系：新規ユーザー追加", function(){
            var queryFromGet = null;
            var dataFromPost = { 
                "username" : "nyan1nyan2nyan3nayn4nayn5nyan6ny",
                "passkey"  : "cat1cat2"
            };
            var api_vi_activitylog_signup = activitylog.api_vi_activitylog_signup;

            stubs.sql_parts.createPromiseForSqlConnection.onCall(0).returns( Promise.resolve() );
            stubs.sql_parts.closeConnection.withArgs( TEST_CONFIG_SQL.database ).returns( Promise.resolve() );
            stubs.sql_parts.isOwnerValid.onCall(0).returns(
                Promise.reject({"here" : "is new user"})
            );
            stubs.sql_parts.getNumberOfUsers.withArgs( TEST_CONFIG_SQL.database ).returns(
                Promise.resolve( 15 )
            );
            activitylog.factoryImpl.MAX_USERS.setStub( 16 );
            stubs.sql_parts.addNewUser.onCall(0).returns(
                Promise.resolve()
            );
           

            return shouldFulfilled(
                api_vi_activitylog_signup( queryFromGet, dataFromPost )
            ).then(function( result ){
                assert( stubs.sql_parts.createPromiseForSqlConnection.calledOnce );
                assert( stubs.sql_parts.isOwnerValid.calledOnce );
                assert( stubs.sql_parts.getNumberOfUsers.calledOnce );
                assert( stubs.sql_parts.addNewUser.calledOnce );
                assert( stubs.sql_parts.closeConnection.calledOnce );

                expect( stubs.sql_parts.addNewUser.getCall(0).args[0] ).to.equal( TEST_CONFIG_SQL.database );
                expect( stubs.sql_parts.addNewUser.getCall(0).args[1] ).to.equal( dataFromPost.username );
                // expect( stubs.sql_parts.addNewUser.getCall(0).args[2] ).to.equal( 128 ); データ数は未定。
                expect( stubs.sql_parts.addNewUser.getCall(0).args[3] ).to.equal( dataFromPost.passkey );
                
                expect( result ).to.have.property( "jsonData" );
                expect( result.jsonData ).to.have.property( "signuped" );
                expect( result.jsonData.signuped ).to.deep.equal({
                    "device_key" : dataFromPost.username,
                    "password"   : dataFromPost.passkey
                });
                expect( result ).to.have.property( "status" ).to.equal( 200 );
            });
        });
        it("正常系：既存ユーザーは、追加しないがOK応答する。", function(){
            var queryFromGet = null;
            var dataFromPost = { 
                "username" : "nyan1nyan2nyan3nayn4nayn5nyan6ny",
                "passkey"  : "cat1cat2"
            };
            var api_vi_activitylog_signup = activitylog.api_vi_activitylog_signup;

            stubs.sql_parts.createPromiseForSqlConnection.onCall(0).returns( Promise.resolve() );
            stubs.sql_parts.closeConnection.withArgs( TEST_CONFIG_SQL.database ).returns( Promise.resolve() );
            stubs.sql_parts.isOwnerValid.onCall(0).returns(
                Promise.resolve( 128 )
            );

            return shouldFulfilled(
                api_vi_activitylog_signup( queryFromGet, dataFromPost )
            ).then(function( result ){
                assert( stubs.sql_parts.createPromiseForSqlConnection.calledOnce );
                assert( stubs.sql_parts.isOwnerValid.calledOnce );
                assert( stubs.sql_parts.getNumberOfUsers.notCalled );
                assert( stubs.sql_parts.addNewUser.notCalled );
                assert( stubs.sql_parts.closeConnection.calledOnce );

                expect( result ).to.have.property( "jsonData" );
                expect( result.jsonData ).to.have.property( "signuped" );
                expect( result.jsonData.signuped ).to.deep.equal({
                    "device_key" : dataFromPost.username,
                    "password"   : dataFromPost.passkey,
                    "left" : 128 // isOwnerValid()が返した数値
                });
                expect( result ).to.have.property( "status" ).to.equal( 200 );
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






