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




describe( "sql_lite_db_test.js", function(){
    /**
     * @type 各テストからはアクセス（ReadOnly）しない定数扱いの共通変数。
     */
    var ORIGINAL = {};
    var sqlConfig = { "database" : "だみ～.sqlite3" };
    beforeEach( function(){
        ORIGINAL[ "sqlite3" ] = sql_parts.factoryImpl.sqlite3.getInstance();
        ORIGINAL[ "dbs" ] = sql_parts.factoryImpl.db.getInstance();
        ORIGINAL[ "_isValidDateFormat" ] = sql_parts.factoryImpl._isValidDateFormat.getInstance();
        ORIGINAL[ "_wrapStringValue"   ] = sql_parts.factoryImpl._wrapStringValue.getInstance();
    });
    afterEach( function(){
        sql_parts.factoryImpl.sqlite3.setStub( ORIGINAL.sqlite3 );
        sql_parts.factoryImpl.db.setStub( ORIGINAL.dbs );
        sql_parts.factoryImpl._isValidDateFormat.setStub( ORIGINAL._isValidDateFormat );
        sql_parts.factoryImpl._wrapStringValue.setStub( ORIGINAL._wrapStringValue );
    });
    

    describe( "::createPromiseForSqlConnection()",function(){
        var createPromiseForSqlConnection = sql_parts.createPromiseForSqlConnection;
        var stubInstance, databaseArgs1, stubDbs = {};

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
            sql_parts.factoryImpl.db.setStub( stubDbs ); // ToDo: これ、ちゃんと動作してる？
        });
    
        it("正常系",function(){
            var dbs = sql_parts.factoryImpl.db.getInstance(); 

            expect( dbs[ sqlConfig.database ] ).to.not.exist;
            return shouldFulfilled(
                sql_parts.createPromiseForSqlConnection( sqlConfig )
            ).then(function(){
                expect( databaseArgs1 ).to.equal( sqlConfig.database, "呼び出したデータベース名でnew Databese()されたこと" );
                expect( dbs[ sqlConfig.database ] ).to.equal( stubInstance, "空だったdbsに、データベースインスタンスが追加されている事" );
            });
        });
        it("異常系");
    });
    describe( "::closeConnection()",function(){
        var closeConnection = sql_parts.closeConnection;
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


    describe( "::addNewUser()",function(){
        var addNewUser = sql_parts.addNewUser;
        it("正常系");
    });
    describe( "::getNumberOfUsers()",function(){
        var getNumberOfUsers = sql_parts.getNumberOfUsers;
        it("正常系");
    });
    describe( "::deleteExistUser()", function () {
       it("正常系"); 
    });



    describe( "::isOwnerValid()", function(){
        var isOwnerValid = sql_parts.isOwnerValid;
        var stubDbs = {};

        beforeEach(function () {
            stubDbs[ sqlConfig.database ] = {};
            sql_parts.factoryImpl.db.setStub( stubDbs );
        });

        it("正常系", function(){
            var databaseName = sqlConfig.database;
            var deviceKey = "にゃ～ん";
            var password = "ほげ";
            var expectedMaxCount = 32;
            var stub_instance = sinon.stub();
            var stub_wrapperStr = sinon.stub()
            .callsFake( function(str){ return str; } );
            var dbs = sql_parts.factoryImpl.db.getInstance();
            
            dbs[ databaseName ] = {
                "all" : stub_instance
            };
            stub_instance.callsArgWith(2, null, [{
                "owners_hash" : deviceKey,
                "password" : password, 
                "max_entrys" : expectedMaxCount
            }]);
            sql_parts.factoryImpl._wrapStringValue.setStub( stub_wrapperStr );

            return shouldFulfilled(
                isOwnerValid( databaseName, deviceKey, password )
            ).then(function (result) {
                assert( stub_wrapperStr.withArgs( deviceKey ).calledOnce );
                assert( stub_wrapperStr.withArgs( password ).calledOnce );
                assert( stub_instance.calledOnce );
                var called_args = stub_instance.getCall(0).args;
                expect( called_args[0] ).to.equal(
                    "SELECT owners_hash, password, max_entrys " 
                    + "FROM owners_permission "
                    + "WHERE [owners_hash]=\'" + deviceKey + "\'"
                );
                expect( called_args[1].length ).to.equal( 0 );
                expect( result ).to.equal( expectedMaxCount );
                
            });
        });
        it("異常系::識別キーは在ったが、パスワードが異なる", function(){
            var databaseName = sqlConfig.database;
            var deviceKey = "にゃ～ん";
            var passwordInput   = "パスワードが不正な場合のテスト";
            var passwordCorrect = "正しいパスワード（）";
            var expectedMaxCount = 32;
            var stub_instance = sinon.stub();
            var stub_wrapperStr = sinon.stub()
            .callsFake( function(str){ return str; } );
            var dbs = sql_parts.factoryImpl.db.getInstance();
            
            dbs[ databaseName ] = {
                "all" : stub_instance
            };
            stub_instance.callsArgWith(2, null, [{
                "owners_hash" : deviceKey,
                "password" : passwordCorrect, 
                "max_entrys" : expectedMaxCount
            }]);
            sql_parts.factoryImpl._wrapStringValue.setStub( stub_wrapperStr );

            return shouldRejected(
                isOwnerValid( databaseName, deviceKey, passwordInput )
            ).catch(function (result) {
                assert( stub_wrapperStr.withArgs( deviceKey ).calledOnce );
                assert( stub_wrapperStr.withArgs( passwordInput ).calledOnce );
                assert( stub_instance.calledOnce );
                var called_args = stub_instance.getCall(0).args;
                expect( called_args[0] ).to.equal(
                    "SELECT owners_hash, password, max_entrys " 
                    + "FROM owners_permission "
                    + "WHERE [owners_hash]=\'" + deviceKey + "\'"
                );
                expect( called_args[1].length ).to.equal( 0 );
                expect( result ).to.have.property( "isDevicePermission" ).to.equal( false );
                expect( result ).to.have.property( "isUserExist" ).to.equal( true );
            });
        });
        it("異常系::識別キー自体が無い", function(){
            var databaseName = sqlConfig.database;
            var deviceKey = "そもそも登録されてないキー";
            var password   = "パスワードの正当性は問わない";
            var expectedMaxCount = 32;
            var stub_instance = sinon.stub();
            var stub_wrapperStr = sinon.stub()
            .callsFake( function(str){ return str; } );
            var dbs = sql_parts.factoryImpl.db.getInstance();
            
            dbs[ databaseName ] = {
                "all" : stub_instance
            };
            stub_instance.callsArgWith(2, null, []); // SQL実行結果が「空」。
            sql_parts.factoryImpl._wrapStringValue.setStub( stub_wrapperStr );

            return shouldRejected(
                isOwnerValid( databaseName, deviceKey, password )
            ).catch(function (result) {
                assert( stub_wrapperStr.withArgs( deviceKey ).calledOnce );
                assert( stub_wrapperStr.withArgs( password ).calledOnce );
                assert( stub_instance.calledOnce );
                var called_args = stub_instance.getCall(0).args;
                expect( called_args[0] ).to.equal(
                    "SELECT owners_hash, password, max_entrys " 
                    + "FROM owners_permission "
                    + "WHERE [owners_hash]=\'" + deviceKey + "\'"
                );
                expect( called_args[1].length ).to.equal( 0 );
                expect( result ).to.have.property( "isDevicePermission" ).to.equal( false );
                expect( result ).to.have.property( "isUserExist" ).to.equal( false );
            });
        });
        it("異常系：SQL実行エラー");
    });
    describe( "::getNumberOfLogs()", function(){
        var getNumberOfLogs = sql_parts.getNumberOfLogs;

        it("正常系");
    });
    describe( "::getListOfActivityLogWhereDeviceKey()",function(){
        var getListOfActivityLogWhereDeviceKey = sql_parts.getListOfActivityLogWhereDeviceKey;

        it("正常系。期間指定なし。",function(){
            var period = null; //無しの場合
            var deviceKey = "にゃーん。";
            var dbs = sql_parts.factoryImpl.db.getInstance();
            var expectedRows = [
                { "created_at": '2017-10-22 23:59:00.000', "type": 900 }
            ];
            var stub_instance = sinon.stub();
            var stub_wrapperStr = sinon.stub()
            .callsFake( function(str){ return str; } );

            dbs[ sqlConfig.database ] = {
                "all" : stub_instance
            };
            stub_instance.callsArgWith(2, /* err= */null, /* rows= */expectedRows);

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
                expect( result ).to.deep.equal( expectedRows );
            });
        });
    });
    describe( "::addActivityLog2Database()", function () {
        var addActivityLog2Database = sql_parts.addActivityLog2Database;
        it("正常系：時刻指定はさせない仕様（内部時間を利用する）", function () {
            var deviceKey = "にゃーん。";
            var typeOfAction = "111";
            var dbs = sql_parts.factoryImpl.db.getInstance();
            var stub_instance = sinon.stub();
            var stub_wrapperStr = sinon.stub().callsFake( function(str){ return str; } );
            var clock = sinon.useFakeTimers(); // これで時間が止まる。「1970-01-01 09:00:00.000」に固定される。
            
            dbs[ sqlConfig.database ] = {
                "all" : stub_instance
            };
            stub_instance.callsArgWith(2, /* err= */null, /* rows= */null);
            sql_parts.factoryImpl._wrapStringValue.setStub( stub_wrapperStr );

            return shouldFulfilled(
                sql_parts.addActivityLog2Database( sqlConfig.database, deviceKey, typeOfAction )
            ).then(function(result){
                clock.restore(); // 時間停止解除。

                assert( stub_wrapperStr.withArgs( deviceKey ).calledOnce );
                assert( stub_instance.calledOnce );

                var called_args = stub_instance.getCall(0).args;
                expect( called_args[0] ).to.equal(
                    "INSERT INTO activitylogs(created_at, type, owners_hash ) " 
                    + "VALUES('1970-01-01 09:00:00.000', " + typeOfAction + ", '" + deviceKey + "')"
                );
                expect( called_args[1].length ).to.equal( 0 );
                expect( result ).to.deep.equal({
                    "type_value" : typeOfAction,
                    "device_key" : deviceKey
                });
            });
            
        });
    });
    describe( "::deleteActivityLogWhereDeviceKey()",function(){
        var deleteActivityLogWhereDeviceKey = sql_parts.deleteActivityLogWhereDeviceKey;
        it("正常系：period.startは無し（endは必須プロパティ）",function(){
            var deviceKey = "にゃーん。";
            var period = {
                "end"   : "2018-01-03 20:00:00.000"
            }; // startプロパティは「無い」場合もあるので注意。
            var dbs = sql_parts.factoryImpl.db.getInstance();
            var stub_instance = sinon.stub();
            var stub_wrapperStr = sinon.stub().callsFake( function(str){ return str; } );
            
            dbs[ sqlConfig.database ] = {
                "all" : stub_instance
            };
            stub_instance.callsArgWith(2, /* err= */null, /* rows= */null); // 0,1､2番がcallback関数。
            sql_parts.factoryImpl._wrapStringValue.setStub( stub_wrapperStr );

            return shouldFulfilled(
                sql_parts.deleteActivityLogWhereDeviceKey( sqlConfig.database, deviceKey, period )
            ).then(function(){ // 戻り値（引数）は無し。
                var EXPECTED_QUERY_STR = "DELETE FROM activitylogs";
                EXPECTED_QUERY_STR += " WHERE [owners_hash]='";
                EXPECTED_QUERY_STR += deviceKey;
                EXPECTED_QUERY_STR += "' AND [created_at] <= '";
                EXPECTED_QUERY_STR += period.end;
                EXPECTED_QUERY_STR += "'";

                assert( stub_wrapperStr.withArgs( deviceKey ).calledOnce );
                assert( stub_instance.calledOnce );

                var called_args = stub_instance.getCall(0).args;
                expect( called_args[0].replace(/ +/g,' ') ).to.equal( EXPECTED_QUERY_STR );
                expect( called_args[1].length ).to.equal( 0 );
                // DELETE FROM activitylogs WHERE [owners_hash]='nyan1nyan2nyan3nayn4nayn5nyan6ny' AND [created_at] > '2018/01/01' AND [created_at] <= '2018/01/04 23:59';
            });
        });
        it("正常系：period.startも有る（endは必須プロパティ）",function(){
            var deviceKey = "にゃーん。";
            var period = {
                "start" : "2018-12-31 08:00:00.123",
                "end"   : "2018-01-03 20:00:00.000"
            }; // startプロパティは「無い」場合もあるので注意。
            var dbs = sql_parts.factoryImpl.db.getInstance();
            var stub_instance = sinon.stub();
            var stub_wrapperStr = sinon.stub().callsFake( function(str){ return str; } );
            
            dbs[ sqlConfig.database ] = {
                "all" : stub_instance
            };
            stub_instance.callsArgWith(2, /* err= */null, /* rows= */null); // 0,1､2番がcallback関数。
            sql_parts.factoryImpl._wrapStringValue.setStub( stub_wrapperStr );

            return shouldFulfilled(
                sql_parts.deleteActivityLogWhereDeviceKey( sqlConfig.database, deviceKey, period )
            ).then(function(){ // 戻り値（引数）は無し。
                var EXPECTED_QUERY_STR = "DELETE FROM activitylogs";
                EXPECTED_QUERY_STR += " WHERE [owners_hash]='";
                EXPECTED_QUERY_STR += deviceKey;
                EXPECTED_QUERY_STR += "' AND [created_at] > '";
                EXPECTED_QUERY_STR += period.start;
                EXPECTED_QUERY_STR += "' AND [created_at] <= '";
                EXPECTED_QUERY_STR += period.end;
                EXPECTED_QUERY_STR += "'";

                assert( stub_wrapperStr.withArgs( deviceKey ).calledOnce );
                assert( stub_instance.calledOnce );

                var called_args = stub_instance.getCall(0).args;
                expect( called_args[0].replace(/ +/g,' ') ).to.equal( EXPECTED_QUERY_STR );
                expect( called_args[1].length ).to.equal( 0 );
                // DELETE FROM activitylogs WHERE [owners_hash]='nyan1nyan2nyan3nayn4nayn5nyan6ny' AND [created_at] > '2018/01/01' AND [created_at] <= '2018/01/04 23:59';
            });
        });
    });

    describe( "::内部関数::_isValidDateFormat()", function(){
        var isValidDateFormat = sql_parts.factoryImpl._isValidDateFormat.getInstance();
        it("正常系：日付のみ指定", function(){
            var result = isValidDateFormat("2017-12-31");
            assert( result );
        })
        it("正常系：日付＋時刻を指定", function(){
            var result = isValidDateFormat("2017-12-31 08:00:23.000");
            assert( result );
        })
        it("異常系：フォーマット違反at日付", function(){
            var result = isValidDateFormat("2017/12/31"); // 区切り文字が「/」で不正。
            assert( !result );
        })
        it("異常系：フォーマット違反at時刻", function(){
            var result = isValidDateFormat("2017-12-31 08:00:23") // ミリ秒が無いケース⇒時刻の指定をするときは、ミリ秒まで必須とする。
            assert( !result );
        })
    })

    describe( "::getInsertObjectFromPostData()", function(){
        it("正常系");
    });
    describe( "::getDeleteObjectFromPostData()", function(){
        var getDeleteObjectFromPostData = sql_parts.getDeleteObjectFromPostData;

        it("正常系：期間指定せず⇒4週間より以前を削除、として扱う", function(){
            var clock = sinon.useFakeTimers(); // これで時間が止まる。「1970-01-01 09:00:00.000」に固定される。
            var spied_isValidDateFormat = sinon.spy( sql_parts.factoryImpl._isValidDateFormat.getInstance() );
            var inputGetData = {
                "device_key" : "デバイス識別キー",
                "pass_key" : "パスキー（ここでは検証しない）"
            };
            var result;
            sql_parts.factoryImpl._isValidDateFormat.setStub( spied_isValidDateFormat );

            result = getDeleteObjectFromPostData( inputGetData );

            clock.restore(); // 時間停止解除。
            expect( result ).to.not.have.property("invalid");
            expect( result ).to.have.property("device_key").to.equal(inputGetData.device_key);
            expect( result ).to.have.property("pass_key").to.equal(inputGetData.pass_key);
            expect( result ).to.not.have.property("date_start"); // ここは設定「無し」になること。
            expect( result ).to.have.property("date_end")
            .to.equal("1969-12-04"); // 「1970-01-01」の4週間前（28日前）が設定されること。

            expect( spied_isValidDateFormat.getCall(0).args[0] ).to.equal("1969-12-04");
        });
        it("正常系：日付での期間指定あり。",function(){
            var clock = sinon.useFakeTimers(); // これで時間が止まる。「1970-01-01 09:00:00.000」に固定される。
            var spied_isValidDateFormat = sinon.spy( sql_parts.factoryImpl._isValidDateFormat.getInstance() );
            var inputGetData = {
                "device_key" : "デバイス識別キー",
                "pass_key" : "パスキー（ここでは検証しない）",
                "date_start" : "2017-12-31",
                "date_end" : "2018-01-06"
            };
            var result;
            sql_parts.factoryImpl._isValidDateFormat.setStub( spied_isValidDateFormat );

            result = getDeleteObjectFromPostData( inputGetData );

            clock.restore(); // 時間停止解除。
            expect( result ).to.not.have.property("invalid");
            expect( result ).to.have.property("device_key").to.equal(inputGetData.device_key);
            expect( result ).to.have.property("pass_key").to.equal(inputGetData.pass_key);
            expect( result ).to.have.property("date_start")
            .to.equal(inputGetData.date_start); // 実際の時刻に依存せず、引数に与えたものが格納されている事。
            expect( result ).to.have.property("date_end")
            .to.equal(inputGetData.date_end);  // 上同。

            // ↓呼び出し順序までは規定したくないのだが、、、やり方が思いつかない。
            expect( spied_isValidDateFormat.getCall(0).args[0] ).to.equal( inputGetData.date_start );
            expect( spied_isValidDateFormat.getCall(1).args[0] ).to.equal( inputGetData.date_end );
        });
        it("異常系：期間指定のパラメータの１つめがフォーマット違反",function () {
            var stubed_isValidDateFormat = sinon.stub(); // これ自体をstubで差替えてテスト。
            var inputGetData = {
                "device_key" : "デバイス識別キー",
                "pass_key" : "パスキー（ここでは検証しない）",
                "date_start" : "ここは何かしら必要"
                // date_endプロパティの有無に寄らず、isValidDateFormat()が呼ばれることは検証済み。
                // ここでの値は省略。
            };
            var result;
            stubed_isValidDateFormat.onCall(0).returns( false );
            stubed_isValidDateFormat.onCall(1).returns( true );
            sql_parts.factoryImpl._isValidDateFormat.setStub( stubed_isValidDateFormat );
            
            result = getDeleteObjectFromPostData( inputGetData );

            expect( result ).to.have.property("invalid");
        });
        it("異常系：期間指定のパラメータの２つめがフォーマット違反",function () {
            var stubed_isValidDateFormat = sinon.stub(); // これ自体をstubで差替えてテスト。
            var inputGetData = {
                "device_key" : "デバイス識別キー",
                "pass_key" : "パスキー（ここでは検証しない）",
                "date_start" : "ここは何かしら必要"
                // date_endプロパティの有無に寄らず、isValidDateFormat()が呼ばれることは検証済み。
                // ここでの値は省略。
            };
            var result;
            stubed_isValidDateFormat.onCall(0).returns( true );
            stubed_isValidDateFormat.onCall(1).returns( false );
            sql_parts.factoryImpl._isValidDateFormat.setStub( stubed_isValidDateFormat );
            
            result = getDeleteObjectFromPostData( inputGetData );

            expect( result ).to.have.property("invalid");
        });
    });
    describe( "::getShowObjectFromGetData()",function(){
        var getShowObjectFromGetData = sql_parts.getShowObjectFromGetData;

        it("正常系：期間指定せず⇒4週間として扱う", function(){
            var clock = sinon.useFakeTimers(); // これで時間が止まる。「1970-01-01 09:00:00.000」に固定される。
            var spied_isValidDateFormat = sinon.spy( sql_parts.factoryImpl._isValidDateFormat.getInstance() );
            var inputGetData = {
                "device_key" : "デバイス識別キー",
                "pass_key" : "パスキー（ここでは検証しない）"
            };
            var result;
            sql_parts.factoryImpl._isValidDateFormat.setStub( spied_isValidDateFormat );

            result = getShowObjectFromGetData( inputGetData );

            clock.restore(); // 時間停止解除。
            expect( result ).to.not.have.property("invalid");
            expect( result ).to.have.property("device_key").to.equal(inputGetData.device_key);
            expect( result ).to.have.property("pass_key").to.equal(inputGetData.pass_key);
            expect( result ).to.have.property("date_start")
            .to.equal("1969-12-04"); // 「1970-01-01」の4週間前（28日前）が設定されること。
            expect( result ).to.have.property("date_end")
            .to.equal("1970-01-01 23:59:59.999");

            // ↓呼び出し順序までは規定したくないのだが、、、やり方が思いつかない。
            expect( spied_isValidDateFormat.getCall(0).args[0] ).to.equal("1969-12-04");
            expect( spied_isValidDateFormat.getCall(1).args[0] ).to.equal("1970-01-01 23:59:59.999");
        });
        it("正常系：日付での期間指定あり。",function(){
            var clock = sinon.useFakeTimers(); // これで時間が止まる。「1970-01-01 09:00:00.000」に固定される。
            var spied_isValidDateFormat = sinon.spy( sql_parts.factoryImpl._isValidDateFormat.getInstance() );
            var inputGetData = {
                "device_key" : "デバイス識別キー",
                "pass_key" : "パスキー（ここでは検証しない）",
                "date_start" : "2017-12-31",
                "date_end" : "2018-01-06"
            };
            var result;
            sql_parts.factoryImpl._isValidDateFormat.setStub( spied_isValidDateFormat );

            result = getShowObjectFromGetData( inputGetData );

            clock.restore(); // 時間停止解除。
            expect( result ).to.not.have.property("invalid");
            expect( result ).to.have.property("device_key").to.equal(inputGetData.device_key);
            expect( result ).to.have.property("pass_key").to.equal(inputGetData.pass_key);
            expect( result ).to.have.property("date_start")
            .to.equal(inputGetData.date_start); // 実際の時刻に依存せず、引数に与えたものが格納されている事。
            expect( result ).to.have.property("date_end")
            .to.equal(inputGetData.date_end);  // 上同。

            // ↓呼び出し順序までは規定したくないのだが、、、やり方が思いつかない。
            expect( spied_isValidDateFormat.getCall(0).args[0] ).to.equal( inputGetData.date_start );
            expect( spied_isValidDateFormat.getCall(1).args[0] ).to.equal( inputGetData.date_end );
        });
        it("異常系：期間指定のパラメータの１つめがフォーマット違反",function () {
            var stubed_isValidDateFormat = sinon.stub(); // これ自体をstubで差替えてテスト。
            var inputGetData = {
                "device_key" : "デバイス識別キー",
                "pass_key" : "パスキー（ここでは検証しない）"
                // date_start, date_endプロパティの有無に寄らず、isValidDateFormat()が呼ばれることは検証済み。
                // ここでの値は省略。
            };
            var result;
            stubed_isValidDateFormat.onCall(0).returns( false );
            stubed_isValidDateFormat.onCall(1).returns( true );
            sql_parts.factoryImpl._isValidDateFormat.setStub( stubed_isValidDateFormat );
            
            result = getShowObjectFromGetData( inputGetData );

            expect( result ).to.have.property("invalid");
        });
        it("異常系：期間指定のパラメータの２つめがフォーマット違反",function () {
            var stubed_isValidDateFormat = sinon.stub(); // これ自体をstubで差替えてテスト。
            var inputGetData = {
                "device_key" : "デバイス識別キー",
                "pass_key" : "パスキー（ここでは検証しない）"
                // date_start, date_endプロパティの有無に寄らず、isValidDateFormat()が呼ばれることは検証済み。
                // ここでの値は省略。
            };
            var result;
            stubed_isValidDateFormat.onCall(0).returns( true );
            stubed_isValidDateFormat.onCall(1).returns( false );
            sql_parts.factoryImpl._isValidDateFormat.setStub( stubed_isValidDateFormat );
            
            result = getShowObjectFromGetData( inputGetData );

            expect( result ).to.have.property("invalid");
        });
    })
});

