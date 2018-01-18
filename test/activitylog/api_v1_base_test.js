
/*
	[api_v1_base_test.js]

	encoding=utf-8
*/

var chai = require("chai");
var assert = chai.assert;
var expect = chai.expect;
var sinon = require("sinon");
var shouldFulfilled = require("promise-test-helper").shouldFulfilled;
var shouldRejected  = require("promise-test-helper").shouldRejected;
require('date-utils');
var ApiCommon_StubAndHooker = require("../support_stubhooker.js").ApiCommon_StubAndHooker;

const api_v1_base = require("../../src/api/activitylog/api_v1_base.js");

var TEST_CONFIG_SQL = { // テスト用
	database : "fake_db_name.sqlite3"
};


describe( "api_v1_base.js", function(){

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
                "deleteExistUser" : sinon.stub(),
                "getInsertObjectFromPostData" : sinon.stub(),
                "getShowObjectFromGetData" : sinon.stub(),
                "getDeleteObjectFromPostData" : sinon.stub(), 
                "getNumberOfLogs" : sinon.stub(),
                "addActivityLog2Database" : sinon.stub(),
                "getListOfActivityLogWhereDeviceKey" : sinon.stub(),
                "deleteActivityLogWhereDeviceKey" : sinon.stub()
            }
        };
    });
    

    describe("::api_vi_activitylog_setup()",function(){
        var stubs, original = {};
        beforeEach(function(){ // 内部関数をフックする。
            original["SETUP_KEY"] = api_v1_base.factoryImpl.SETUP_KEY.getInstance(); 
            stubs = COMMON_STUB_MANAGER.createStubs();

            COMMON_STUB_MANAGER.hookInstance( api_v1_base, stubs );
        });
        afterEach(function(){
            COMMON_STUB_MANAGER.restoreOriginal( api_v1_base );
            api_v1_base.factoryImpl.SETUP_KEY.setStub( original.SETUP_KEY );
        });

        it("正常系", function(){
            var queryFromGet = null;
            var dataFromPost = { "create_key" : "せっとあっぷきー" };
            var EXPECTED_NEW_TABLE = { "hoge" : "fuga" };
            var api_vi_activitylog_setup = api_v1_base.api_vi_activitylog_setup;

            api_v1_base.factoryImpl.SETUP_KEY.setStub( dataFromPost.create_key );
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
            var api_vi_activitylog_setup = api_v1_base.api_vi_activitylog_setup;
    
            api_v1_base.factoryImpl.SETUP_KEY.setStub( dataFromPost.create_key );
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
            var api_vi_activitylog_setup = api_v1_base.api_vi_activitylog_setup;
    
            api_v1_base.factoryImpl.SETUP_KEY.setStub( "期待キー" );

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


    describe("::api_v1_activitylog_BASE()", function() {
        var stubs;
        var API_V1_BASE = api_v1_base.API_V1_BASE;

        /**
         * @type beforeEachで初期化される。
         */
        beforeEach(function(){ // 内部関数をフックする。
            stubs = COMMON_STUB_MANAGER.createStubs();

            COMMON_STUB_MANAGER.hookInstance( api_v1_base, stubs );
        });
        afterEach(function(){
            COMMON_STUB_MANAGER.restoreOriginal( api_v1_base );
        });

        // ここからテスト。
        it("正常系", function(){
            var instance = new API_V1_BASE( api_v1_base.factoryImpl.CONFIG_SQL, api_v1_base.factoryImpl.sql_parts );
            var spied_requestSql = sinon.spy( instance, "requestSql" );
            var inputData = {
                "device_key" : "これは識別キー。必ず必要",
                "pass_key"   : "これもセットで識別する。"
            };
            var EXPECTED_MAX_COUNT = 32;

            stubs.sql_parts.createPromiseForSqlConnection.withArgs( TEST_CONFIG_SQL ).returns( Promise.resolve() );
            stubs.sql_parts.closeConnection.onCall(0).returns( Promise.resolve() );
            stubs.sql_parts.isOwnerValid.onCall(0).returns(
                Promise.resolve( EXPECTED_MAX_COUNT )
            );

            return shouldFulfilled(
                instance.run( inputData )
            ).then(function( result ){
                assert( stubs.sql_parts.createPromiseForSqlConnection.calledOnce );
                assert( stubs.sql_parts.closeConnection.calledOnce );

                assert( stubs.sql_parts.isOwnerValid.calledOnce );
                expect( stubs.sql_parts.isOwnerValid.getCall(0).args[0] ).to.equal( TEST_CONFIG_SQL.database );
                expect( stubs.sql_parts.isOwnerValid.getCall(0).args[1] ).to.equal( inputData.device_key );
                expect( stubs.sql_parts.isOwnerValid.getCall(0).args[2] ).to.equal( inputData.pass_key ); 

                assert( spied_requestSql.calledOnce );
                expect( spied_requestSql.getCall(0).args[0] ).to.have.property("getDeviceKey");
                expect( spied_requestSql.getCall(0).args[0] ).to.have.property("getPassKey");
                expect( spied_requestSql.getCall(0).args[0] ).to.have.property("getTypeValue");
               
                expect( result ).to.be.exist;
                expect( result ).to.have.property("jsonData");
                expect( result ).to.have.property("status").to.equal(200);
            });
        });
        it("異常系：認証NGの401");
    });
    
});
/*
    参照先Webページメモ
    http://chaijs.com/api/bdd/
    http://sinonjs.org/docs/
    http://qiita.com/xingyanhuan/items/da9f814ce4bdf8f80fa1
    http://azu.github.io/promises-book/#basic-tests
*/






