/*
    [hello_test.js]

    encoding=utf-8
*/

var chai = require("chai");
var assert = chai.assert;
var expect = chai.expect;
var sinon = require("sinon");
var shouldFulfilled = require("promise-test-helper").shouldFulfilled;
var shouldRejected  = require("promise-test-helper").shouldRejected;

const hello = require("../src/api/hello.js");


exports.world = function( queryFromGet, dataFromPost ){
    var name = queryFromGet.name;
    var out_data = { 
        "status" : 200,
        "jsonData" : "hello world, " + name + "!" 
    };
    var promise = new Promise(function(resolve,reject){
        setTimeout(function() {
            // 非同期の処理を模している。
            resolve( out_data );
        }, 100);
    });
    return promise;
};

describe( "hello.js", function(){
    var helloWorld = hello.world;

    describe("::RESTful over Expressトライアル", function(){
		it("world()", function(){
            var queryFromGet = { "name" : "My Azure" };
            var dataFromPost = null;
            var promise;
            this.timeout(5000);

            promise = helloWorld( queryFromGet, dataFromPost );

            return shouldFulfilled(
                promise
			).then(function( result ){
                expect( result.status ).to.equal( 200 );
                expect( result.jsonData).to.equal( "hello world, My Azure!" );
			});
		});
	});
});

