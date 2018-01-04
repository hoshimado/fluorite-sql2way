/*
    [vue_promise_test.js]
    encoding=utf-8
*/

var chai = require("chai");
var assert = chai.assert;
var expect = chai.expect;
var sinon = require("sinon");
var promiseTestHelper = require("promise-test-helper");
var shouldFulfilled = promiseTestHelper.shouldFulfilled;
var target = require("../src/public/javascripts/vue_client.js");


describe("TEST for vue_client.js", function(){
    this.timeout( 5000 );
    var stub_vue, stub_static_vue;
    var stub_fooked_axios = {};
	var original;
	beforeEach(()=>{ // フック前の関数を保持する。
		original = {
            "vueAccountInstance" : target.client_lib.vueAccountInstance,
            "axios" : target.client_lib.axios,
            "isServerTimeZoneGMT" : target.client_lib.isServerTimeZoneGMT,
            "convertTimezoneInActivityList" : target.client_lib.convertTimezoneInActivityList
        };

        stub_vue = sinon.stub();
        stub_static_vue = {
            "component" : sinon.stub()
        };

        target.client_lib.vueAccountInstance = {
            "userName"    : "dummy_Name12",
            "passKeyWord" : "dummy_KeyWord15"
        };
        target.client_lib.axios = stub_fooked_axios;
	});
	afterEach(()=>{ // フックした（かもしれない）関数を、元に戻す。
        // target.set.data_manager = original.data_manager;

        target.client_lib.vueAccountInstance = original.vueAccountInstance;
        target.client_lib.axios = original.axios;
        target.client_lib.isServerTimeZoneGMT = original.isServerTimeZoneGMT;
        target.client_lib.convertTimezoneInActivityList = original.convertTimezoneInActivityList;
	});

    describe("::setVueComponentGrid()",function(){
        it('construct', function(){
            var setVueComponentGrid = target.setVueComponentGrid( stub_static_vue );

            assert( stub_static_vue.component.getCall(0).args );
            expect( stub_static_vue.component.getCall(0).args[0] ).to.equal("vue-my-element-grid");

            var args1 = stub_static_vue.component.getCall(0).args[1];
            expect( args1 ).to.have.property("template").to.equal("#grid-template");
            expect( args1 ).to.have.property("props");
            expect( args1.props ).to.have.property( "data" ); // "[Function: Array]"であることの検証は、、、Skip
            expect( args1.props ).to.have.property( "columns"); // "[Function: Array]"であることの検証は、、、Skip
            expect( args1 ).to.have.property("computed"); // "[Function]"であることの検証は、、、Skip
        });
    });
    describe("::vueAppGrid()",function(){
        it('construct', function(){
            var vueAppGrid = target.vueAppGrid( stub_vue );

            expect( stub_vue.callCount ).to.equal( 1, "（今の設計では）vueAppGrid()が1回だけ呼ばれること。" )
            expect( stub_vue.getCall(0).args[0] ).to.be.exist;

            //  el: '#app_grid',
            //  data:
            //   { searchQuery: '',
            //     gridColumns: [ 'time', 'activity' ],
            //     gridData: [],
            //     TEXT_GETUP: '起きた',
            //     TEST_GOTOBED: '寝る',
            //     chartIconColorBar: 'color:#4444ff',
            //     chartIconColorLine: 'color:#aaaaaa',
            //     lodingSpinnerDivStyle: { display: 'block' },
            //     normalShownDivStyle: { display: 'none' },
            //     lastLoadedActivityData: null,
            //     actionButtonDivStyle: { display: 'none' },
            //     processingDivStyle: { display: 'none' } },
            //  methods:
            //   { getGridData: [Function],
            //     noticeGotUp: [Function],
            //     noticeGotoBed: [Function],
            //     refreshData: [Function],
            //     setChartStyleLine: [Function],
            //     setChartStyleBar: [Function] },
            //  mounted: [Function] }
            // 
            var args0 = stub_vue.getCall(0).args[0];
            expect( args0 ).to.have.property("el").to.equal("#app_grid");
            expect( args0 ).to.have.property("data");
            expect( args0 ).to.have.property("methods");
            expect( args0 ).to.have.property("mounted");

            // 不安なところだけテストする。
            // ⇒ html側に記載する呼び出し関数は、無いとVue.js描画がエラーするのでチェックする。
            var methods = args0.methods;
            expect( methods ).to.have.property("getGridData");
            expect( methods ).to.have.property("noticeGotUp");
            expect( methods ).to.have.property("noticeGotoBed");
            expect( methods ).to.have.property("refreshData");
            expect( methods ).to.have.property("setChartStyleLine");
            expect( methods ).to.have.property("setChartStyleBar");
            expect( methods ).to.have.property("showModalDialogForDeletingLastData");
            expect( methods ).to.have.property("cancelModalDialogForDeletingLastData");
            expect( methods ).to.have.property("deleteLastData");
        });

    });
    describe("::promiseCreateAccount()",function(){
        it('正常系', function(){
            var mailAddress = "hogehoge";
            var promiseCreateAccount = target.promiseCreateAccount;

            // ※「stub_fooked_axios」はbeforeEach(), afterEach() の外で定義済み＆clinet_libに接続済み。
            stub_fooked_axios["get"] = sinon.stub();
            stub_fooked_axios["post"] = sinon.stub();
            
            return shouldFulfilled(
                promiseCreateAccount( mailAddress )
            ).then(function(result){
                expect(result).to.equal( stub_fooked_axios );
            });
        });
    });


    describe("::addActivityDataInAccordanceWithAccountVue()", function(){
        it("正常系：テスト構築はまだ途中。", function(){
            var addActivityDataInAccordanceWithAccountVue = target.client_lib.addActivityDataInAccordanceWithAccountVue;

            // ※「stub_fooked_axios」はbeforeEach(), afterEach() の外で定義済み＆clinet_libに接続済み。
            stub_fooked_axios["get"] = sinon.stub();
            stub_fooked_axios["post"] = sinon.stub()
            .callsFake((url, postData)=>{
                // postData = {
                //    "device_key" : savedUserName,
                //    "pass_key" : savedPassKey,
                //    "type_value" : typeValue
                //}
                return Promise.resolve({
                    "data" : {
                        "result" : "結果データ",
                        "device_key" : "渡したデバイスキー"
                    }
                });
            });

            // client_lib.vueAccountInstance には、beforeEach(), afterEach() にて、
            // ダミー値を設定済み。【ToDo】文字数の都合で、今は「fake」側へ流れる。
            //
            // 実動作環境では、以下を持つVue.jsインスタンスが、_vueAppSetup()の戻り値を
            // 経由して設定される（（dataプロパティ名は省略してアクセス可能）。
            // data: {
            //    "userName": "",
            //    "passKeyWord" : ""
            // },
            
            // 【ToDo】引数に typeValueを渡すのが正しい呼び出し。
            return shouldFulfilled(
                addActivityDataInAccordanceWithAccountVue()
            ).then(function(){
                var stub_post = stub_fooked_axios.post;
                expect( stub_fooked_axios.get.callCount ).to.equal( 0, "axios.get()は呼ばれないこと。" )
                expect( stub_post.getCall(0).args[0] ).to.equal("./api/v1/activitylog/add");
                // 【ToDo】これ以外は何もテストできてない。
            });
        });
    });
    describe("::getActivityDataInAccordanceWithAccountVue()", function(){
        it("正常系：テスト構築はまだ途中。", function(){
            var getActivityDataInAccordanceWithAccountVue = target.client_lib.getActivityDataInAccordanceWithAccountVue;

            // ※「stub_fooked_axios」はbeforeEach(), afterEach() の外で定義済み＆clinet_libに接続済み。
            stub_fooked_axios["get"] = sinon.stub()
            .callsFake((url, postData)=>{
                // getData = {
                //    "crossdomain" : true,
                //    "params" : {
                //        "device_key" : savedUserName,
                //        "pass_key" : savedPassKey
                //    }
                // }
                return Promise.resolve({
                    "data" : 
                    {
                        "result":"fake ajax is is OK!",
                        "table":[
                            { "created_at" : "2017-10-13 06:00:00.000", "type" : 101 },
                            { "created_at" : "2017-10-13 23:45:00.000", "type" : 101 },
                            { "created_at" : "2017-10-14 08:30:20.000", "type" : 102 },
                            { "created_at" : "2017-10-16 00:38:21.000", "type" : 101 }
                        ]
                    }        
                });
            });
            stub_fooked_axios["post"] = sinon.stub();

            // client_lib.vueAccountInstance には、beforeEach(), afterEach() にて、
            // ダミー値を設定済み。【ToDo】文字数の都合で、今は「fake」側へ流れる。
            //
            // 実動作環境では、以下を持つVue.jsインスタンスが、_vueAppSetup()の戻り値を
            // 経由して設定される（（dataプロパティ名は省略してアクセス可能）。
            // data: {
            //    "userName": "",
            //    "passKeyWord" : ""
            // },
            
            // 【ToDo】引数に typeValueを渡すのが正しい呼び出し。
            return shouldFulfilled(
                getActivityDataInAccordanceWithAccountVue()
            ).then(function(){
                var stub_get = stub_fooked_axios.get;
                expect( stub_fooked_axios.post.callCount ).to.equal( 0, "axios.post()は呼ばれないこと。" )
                expect( stub_get.getCall(0).args[0] ).to.equal("./api/v1/activitylog/show");
                // 【ToDo】これ以外は何もテストできてない。
            });
        });
    });
    describe("::deleteLastActivityDataInAccordanceWithGrid()", function(){
        it("正常系：サーバー側のタイムゾーンはGMT", function(){
            var deleteLastActivityDataInAccordanceWithGrid = target.client_lib.deleteLastActivityDataInAccordanceWithGrid;
            var fakeGridArray = [
                { "created_at" : "2017-10-13 01:00:00.000", "type" : 101 },
                { "created_at" : "2017-10-13 06:00:00.000", "type" : 101 },
                { "created_at" : "2017-10-13 23:45:00.000", "type" : 101 },
                { "created_at" : "2017-10-14 08:30:20.000", "type" : 102 },
                { "created_at" : "2017-10-14 23:30:00.000", "type" : 101 },
                { "created_at" : "2017-10-15 06:00:20.000", "type" : 102 },
                { "created_at" : "2017-10-16 00:38:21.000", "type" : 101 },
                { "created_at" : "2017-10-16 06:23:57.000", "type" : 102 }                
            ];
            var spied_isServerTimeZoneGMT = sinon.stub()
            .callsFake(()=>{ return true; }); // サーバー側は「GMT」判定を返すとする。
            var spied_convertTimezoneInActivityList = sinon.spy( target.client_lib.convertTimezoneInActivityList );
            target.client_lib.isServerTimeZoneGMT = spied_isServerTimeZoneGMT;
            target.client_lib.convertTimezoneInActivityList = spied_convertTimezoneInActivityList;

            // ※「stub_fooked_axios」はbeforeEach(), afterEach() の外で定義済み＆clinet_libに接続済み。
            stub_fooked_axios["get"] = sinon.stub();
            stub_fooked_axios["post"] = sinon.stub()
            .callsFake((url, postData)=>{
                // postData = {
                //    "device_key" : savedUserName,
                //    "pass_key" : savedPassKey,
                //    "type_value" : typeValue
                //}
                return Promise.resolve({
                    "data" : {
                        "result" : "結果データ",
                        "device_key" : "渡したデバイスキー"
                    }
                });
            });

            // client_lib.vueAccountInstance には、beforeEach(), afterEach() にて、
            // 以下を設定済み。
            // 実動作環境では、以下を持つVue.jsインスタンスが、_vueAppSetup()の戻り値を
            // 経由して設定される（（dataプロパティ名は省略してアクセス可能）。
            // data: {
            //    "userName": "",
            //    "passKeyWord" : ""
            // },
            
            return shouldFulfilled(
                deleteLastActivityDataInAccordanceWithGrid( fakeGridArray )
            ).then(function(){
                expect( spied_isServerTimeZoneGMT.callCount ).to.equal( 1, "isServerTimeZoneGMT()を1度呼ぶこと" );
                expect( spied_convertTimezoneInActivityList.callCount).to.equal( 1, "convertTimezoneInActivityList()を1度呼ぶこと" );
                expect( spied_convertTimezoneInActivityList.getCall(0).args[0] ).to.deep.equal( fakeGridArray );
                expect( spied_convertTimezoneInActivityList.getCall(0).args[1] ).to.equal( -9 );

                var stub_post = stub_fooked_axios.post;
                expect( stub_fooked_axios.get.callCount ).to.equal( 0, "axios.get()は呼ばれないこと。" )
                expect( stub_post.getCall(0).args[0] ).to.equal("./api/v1/activitylog/delete");

            });
        });
    });
});



