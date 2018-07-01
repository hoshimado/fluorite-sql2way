/*
    [hook4src_test.js]
    encoding=utf-8
*/

var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var sinon = require("sinon");
var promiseTestHelper = require("promise-test-helper");
var shouldFulfilled = promiseTestHelper.shouldFulfilled;

var target = require("../src/hook4src.js");


describe("TEST for hook4src.js", function(){
    // this.timeout( 5000 );
    var createHookPoint = target.createHookPoint;
    beforeEach(()=>{ // フック前の関数を保持する。
        // helper4stubed.hookProperty( hook, stubs );
        // console.log( hook );
	});
    afterEach(()=>{ // フックした（かもしれない）関数を、元に戻す。
        // helper4stubed.restoreProperty( hook );
        // console.log( hook );
	});

    describe("createHookPoint()",function(){
        it("set the new object in property of exports.", function(){
            var outputPoint = {}; // fake as exports.
            var nameVar = "innerInstance";
            var innerInstance = target.createHookPoint( outputPoint, nameVar );

            expect( outputPoint ).to.have.property( nameVar );
            expect( outputPoint[ nameVar ] ).to.equal( innerInstance );
        });

        it("set the exist object in property of exports.", function(){
            var outputPoint = {}; // fake as exports.
            var nameVar = "innerInstance";
            var existInstance = { 
                "dummy" : sinon.stub()
             }
            var innerInstance = target.createHookPoint( outputPoint, nameVar, existInstance );

            expect( outputPoint ).to.have.property( nameVar );
            expect( outputPoint[ nameVar ] ).to.equal( innerInstance );
            expect( innerInstance ).to.deep.equal( existInstance );
        });

        it("don't set the object in property of exports when NODE_ENV is undefined.", function () {
            var original_vaule = process.env.NODE_ENV;
            process.env.NODE_ENV = undefined; // before

            var outputPoint = {}; // fake as exports.
            var nameVar = "innerInstance";
            var innerInstance = target.createHookPoint( outputPoint, nameVar );

            expect( outputPoint ).to.not.have.property( nameVar );
            
            process.env.NODE_ENV = original_vaule; // after
        });
    });
});






