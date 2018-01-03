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
    var stub_vue, stub_static_vue, stub_axios;
	var original;
	beforeEach(()=>{ // フック前の関数を保持する。
		original = { 
        };

        stub_vue = sinon.stub();
        stub_static_vue = {
            "component" : sinon.stub()
        };
        stub_axios = sinon.stub();
        // axiosInstance.get(url).then();
	});
	afterEach(()=>{ // フックした（かもしれない）関数を、元に戻す。
        // target.set.data_manager = original.data_manager;
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
            expect( methods ).to.have.property("deleteLastData");
        });

    });
    describe("::promiseCreateAccount()",function(){
        it('正常系', function(){
            var stub_axios = {
                "get" : sinon.stub(),
                "post" : sinon.stub()
            };
            var mailAddress = "hogehoge";
            var promiseCreateAccount = target.promiseCreateAccount;
            target.client_lib.axios = stub_axios;
            
            var promise = promiseCreateAccount( mailAddress );
            return shouldFulfilled(
                promise
            ).then(function(result){
                expect(result).to.equal( stub_axios );
            });
        });
    });
});



