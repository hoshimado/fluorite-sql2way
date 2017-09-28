/*
    [vue_promise_test.js]
    encoding=utf-8
*/

var chai = require("chai");
var expect = chai.expect;
var sinon = require("sinon");
var promiseTestHelper = require("promise-test-helper");
var shouldFulfilled = promiseTestHelper.shouldFulfilled;
var target = require("../src/public/javascripts/vue_client.js");


describe("TEST for vue_client.js", function(){
    this.timeout( 5000 );
    var stub_vue, stub_axios;
	var original;
	beforeEach(()=>{ // フック前の関数を保持する。
		original = { 
        };

        stub_vue = sinon.stub();
        // axiosInstance.get(url).then();
	});
	afterEach(()=>{ // フックした（かもしれない）関数を、元に戻す。
        // target.set.data_manager = original.data_manager;
	});

    describe("VueはnewしなけりゃMocha簡単だよね？::",function(){
        it('setupVue()', function(){
            var setupVue = target.setupVue( stub_vue, stub_axios );

            expect( stub_vue.getCall(0).args[0] ).to.be.exist;
console.log( stub_vue.getCall(0).args[0] );
        });
/*
        it('sub.run()', function(){
            var promise = target.subInstance.run();
            return shouldFulfilled(
                promise
            ).then(function(result){
                console.log(result);
            });
        });
*/
    });
});



