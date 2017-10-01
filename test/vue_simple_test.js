/*
    [vue_promise_test.js]
    encoding=utf-8
*/

var chai = require("chai");
var expect = chai.expect;
var sinon = require("sinon");
var promiseTestHelper = require("promise-test-helper");
var shouldFulfilled = promiseTestHelper.shouldFulfilled;
var target = require("../src/public/javascripts/vue_simple.js");


describe("TEST for vue_simple.js", function(){
    var stub_vue;
	beforeEach(()=>{ // フック前の関数を保持する。
        stub_vue = sinon.stub();
	});
	afterEach(()=>{ // フックした（かもしれない）関数を、元に戻す。
	});

    describe("VueはnewしなけりゃMocha簡単だよね？::",function(){
        it('setupVue()', function(){
            var setupVue = target.setupVue( stub_vue );
            var called_options = stub_vue.getCall(0).args[0];

            expect( called_options ).to.be.exist;
            expect( called_options.el ).to.equal( "#app" );
            expect( called_options.data ).to.deep.equal({
                "message" : "Hello Vue!"
            });

        });
        it("::reverseMessage()", function(){
            var setupVue = target.setupVue( stub_vue );
            var called_options = stub_vue.getCall(0).args[0];

            expect( called_options.methods.reverseMessage ).to.be.exist;
            var reverseMessage = called_options.methods.reverseMessage;
            var stub_instance = {"message" : "Hello!"};
            reverseMessage.apply( stub_instance );
            expect( stub_instance.message ).to.equal("!olleH");
        });
    });
});



