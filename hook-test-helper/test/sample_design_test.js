/*
    [sample_design_test.js]
    encoding=utf-8
*/

var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var sinon = require("sinon");
var promiseTestHelper = require("promise-test-helper");
var shouldFulfilled = promiseTestHelper.shouldFulfilled;
var hookProperty = require("../src/hook4test.js").hookProperty;

var target = require("../sample/sample_design.js");


describe("TEST for sample_design.js", function(){
    var method1 = target.method1;
    var stubbed = {};
    var stubs;
    beforeEach(()=>{ // フック前の関数を保持する。
        stubs = {
            "open" : sinon.stub(),
            "close" : sinon.stub(),
            "doSomething" : sinon.stub()
        };
        stubbed["hook"] = hookProperty(target.hook, stubs);
	});
    afterEach(()=>{ // フックした（かもしれない）関数を、元に戻す。
        stubbed.hook.restore();
	});

    describe("method1()",function(){
        it("do something with open and close.", function(){
            var keyword = "dummy";
            var HANDLE = "STUB HANDLE";
            var EXPECTED_RESULT = "fake result";

            stubs.open.onCall(0).returns(
                Promise.resolve(HANDLE)
            );
            stubs.doSomething.withArgs(HANDLE).returns(
                Promise.resolve(EXPECTED_RESULT)
            );
            stubs.close.onCall(0).returns(
                Promise.resolve()
            );
            
            return shouldFulfilled(
                method1(keyword)
            ).then(function (result) {
                assert(stubs.open.calledOnce, "open() is called.")
                assert(stubs.doSomething.calledOnce, "doSomething() is called.")
                assert(stubs.close.calledOnce, "close() is called.")
                expect(result).to.equal(EXPECTED_RESULT);
            });
        });
    });
});






