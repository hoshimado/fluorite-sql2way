/* eslint-env mocha */
/**
 * [method_test.js]
 */

var chai = require("chai");
var assert = chai.assert;
var expect = chai.expect;
var sinon = require("sinon");
var shouldFulfilled = require("promise-test-helper").shouldFulfilled;
var shouldRejected  = require("promise-test-helper").shouldRejected;
var hookProperty = require("../../hook-test-helper").hookProperty;


describe("method.js", function(){
    var target = require("../src/method.js");

    describe("getAssociatedKey()",function () {
        var authenticateKey = target.getAssociatedKey;
        var hooked = {};
        var stub_sqlite3_instance;
        var DUMMY_SQLITE3_VERBOSE = function(){};
        DUMMY_SQLITE3_VERBOSE.prototype.Database = function (DatabaseName,callback) {
            setTimeout(() => {
                callback(
                    stub_sqlite3_instance._constructor( DatabaseName )
                );
            }, 100);
            return stub_sqlite3_instance; // newで呼ばれた場合のデフォルト this に代えて、これを返却する。
        };
        var stub_sqlite3_verbose = new DUMMY_SQLITE3_VERBOSE();
        var stub_sqlite3_databese = sinon.stub(stub_sqlite3_verbose,"Database");

        beforeEach(function () {
            stub_sqlite3_instance = {
                "_constructor" : sinon.stub(),
                "all" : sinon.stub(),
                "close" : sinon.stub()
            };
            hooked["sqlite3"] = hookProperty(target.sqlite3,{
                "verbose" : function(){
                    return {
                        "Database" : stub_sqlite3_databese
                    };
                }
            });
            stub_sqlite3_databese.reset();
        });
        afterEach(function () {
            hooked["sqlite3"].restore();
        });
        it("success to get the associated key with the base key.",function () {
            var INPUT_KEY = "元に成るキー";

            return shouldFulfilled(
                authenticateKey( INPUT_KEY )
            ).then(function (result) {
                // assert(stub_sqlite3_databese.Database.calledWithNew(), "sqlite3.verbose.Database()をnewしてインスタンスを生成する。");
                // spy.calledWithNew();
                // Returns true if spy/stub was called the new operator.

                expect(result).to.have.property("associated_key");
            });
        });
    })
});
