/*
    [hook4test_test.js]
    encoding=utf-8
*/

var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var sinon = require("sinon");
var promiseTestHelper = require("promise-test-helper");
var shouldFulfilled = promiseTestHelper.shouldFulfilled;

var target = require("../src/hook4test.js");


describe("TEST for hook4test.js", function(){
    // this.timeout( 5000 );
    var hookProperty = target.hookProperty;
    var restoreProperty = target.restoreProperty;
    beforeEach(()=>{ // フック前の関数を保持する。
        // helper4stubed.hookProperty( hook, stubs );
        // console.log( hook );
	});
    afterEach(()=>{ // フックした（かもしれない）関数を、元に戻す。
        // helper4stubed.restoreProperty( hook );
        // console.log( hook );
	});

    describe("hookProperty()",function(){
        it("hook 1-set of property and restore.", function(){
            var api11 = sinon.stub(), api12 = sinon.stub();
            var api21 = sinon.stub(), api22 = sinon.stub();
            var base_module = {
                "hook1" : {
                    "api1" : api11,
                    "api2" : api12
                },
                "hook2" : {
                    "api3" : api21,
                    "api4" : api22
                },
                "localFunc" : sinon.stub()
            };
            var stubs1 = {
                "api1" : sinon.stub(),
                "api2" : sinon.stub()
            };
            var stubs2 = {
                "api3" : sinon.stub(),
                "api4" : sinon.stub()
            };

            var hookedInstance = hookProperty( base_module.hook1, stubs1 );

            base_module.hook1.api1();
            expect( api11.callCount ).to.equal( 0 );
            assert( stubs1.api1.calledOnce, "差し替えた先のstubs::api1()を1度だけ呼ぶ。" );
            base_module.hook1.api2();
            expect( api12.callCount ).to.equal( 0 );
            assert( stubs1.api2.calledOnce, "差し替えた先のstubs::api1()を1度だけ呼ぶ。" );

            base_module.hook2.api3();
            expect( api21.callCount ).to.equal( 1 );
            expect( stubs2.api3.callCount).to.equal( 0 );
            base_module.hook2.api4();
            expect( api22.callCount ).to.equal( 1 );
            expect( stubs2.api4.callCount).to.equal( 0 );

            hookedInstance.restore();

            base_module.hook1.api1();
            expect( api11.callCount ).to.equal( 1 );
            base_module.hook1.api2();
            expect( api12.callCount ).to.equal( 1 );
        });

        it("hook some-set property and restore.", function(){
            var api11 = sinon.stub(), api12 = sinon.stub();
            var api21 = sinon.stub(), api22 = sinon.stub();
            var base_module = {
                "hook1" : {
                    "api1" : api11,
                    "api2" : api12
                },
                "hook2" : {
                    "api3" : api21,
                    "api4" : api22
                },
                "localFunc" : sinon.stub()
            };
            var stubs1 = {
                "api1" : sinon.stub(),
                "api2" : sinon.stub()
            }
            var stubs2 = {
                "api3" : sinon.stub(),
                "api4" : sinon.stub()
            }

            var hookedInstance1 = hookProperty( base_module.hook1, stubs1 );
            var hookedInstance2 = hookProperty( base_module.hook2, stubs2 );

            base_module.hook1.api1();
            expect( api11.callCount ).to.equal( 0 );
            assert( stubs1.api1.calledOnce, "差し替えた先のstubs::api1()を1度だけ呼ぶ。" );
            base_module.hook1.api2();
            expect( api12.callCount ).to.equal( 0 );
            assert( stubs1.api2.calledOnce, "差し替えた先のstubs::api1()を1度だけ呼ぶ。" );

            base_module.hook2.api3();
            expect( api21.callCount ).to.equal( 0 );
            assert( stubs2.api3.calledOnce, "差し替えた先のstubs::api3()を1度だけ呼ぶ。" );
            base_module.hook2.api4();
            expect( api22.callCount ).to.equal( 0 );
            assert( stubs2.api4.calledOnce, "差し替えた先のstubs::api4()を1度だけ呼ぶ。" );

            hookedInstance1.restore();
            hookedInstance2.restore();

            base_module.hook1.api1();
            expect( api11.callCount ).to.equal( 1 );
            base_module.hook1.api2();
            expect( api12.callCount ).to.equal( 1 );
            base_module.hook2.api3();
            expect( api21.callCount ).to.equal( 1 );
            base_module.hook2.api4();
            expect( api22.callCount ).to.equal( 1 );

        });
        it("tries to hook null.");
       
    });
});


