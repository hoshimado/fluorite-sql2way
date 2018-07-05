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

        // connection.all(), close(),,
        var stub_sqlite3connection; 

        // connection = new sqlite3.verbose().Database(); で、且つcallback渡して接続する。
        var FAKE_SQLITE3_DATABASE_FACTORY = function(){};
        FAKE_SQLITE3_DATABASE_FACTORY.prototype.Database = function (DatabaseName,callback) {
            setTimeout(() => {
                callback(
                    // ★戻り値。成功時はnull。失敗ならerr={}を返すのがAPI仕様。
                    stub_sqlite3connection._constructor( DatabaseName )
                );
            }, 100);
            return stub_sqlite3connection; // newで呼ばれた場合のデフォルト this に代えて、これを返却する。
        };
        var dummy_database_instance = new FAKE_SQLITE3_DATABASE_FACTORY();

        // sqlite3のAPIをフックする。
        var hooked = {};
        beforeEach(function () {
            stub_sqlite3connection = {
                "_constructor" : sinon.stub(),
                "all" : sinon.stub(),
                "close" : sinon.stub()
            };
            hooked["sqlite3"] = hookProperty(target.sqlite3,{
                "verbose" : function(){
                    return dummy_database_instance;
                }
            });
        });
        afterEach(function () {
            hooked["sqlite3"].restore();
        });

        it("success to get the associated key with the base key.",function () {
            var INPUT_KEY = "元に成るキー";
            var EXPECTED_ROWS = [{"hoge":"piyo"}];
            var spied_sqlite3_databese_factory = sinon.spy(dummy_database_instance,"Database");
            stub_sqlite3connection._constructor.onCall(0).returns(null); // ★エラー無しはnullを返却。

            // 引数の2(0,1,2)番目をcallback(err,rows)で呼び出して応答する。
            stub_sqlite3connection.all.callsArgWith(2, /* err= */null, /* rows= */EXPECTED_ROWS);

            // 引数の0番目をcallback(null)で呼び出して応答する。
            stub_sqlite3connection.close.callsArgWith(0, null);

            return shouldFulfilled(
                authenticateKey( INPUT_KEY )
            ).then(function (result) {
                assert(spied_sqlite3_databese_factory.calledWithNew(), "sqlite3.verbose.Database()をnewしてインスタンスを生成する。");

                assert(stub_sqlite3connection.all.calledOnce, "sqlite3#[new Database()が返すインスタンス].all()を呼ぶ。");
                expect(stub_sqlite3connection.all.getCall(0).args[0]).to.equal("◆Query文字列【これから決める】");
                expect(stub_sqlite3connection.all.getCall(0).args[1].length).to.equal(0); // 渡されるarreyは要素不要。

                assert(stub_sqlite3connection.close.calledOnce, "sqlite3#close()を呼ぶこと。");

                expect(result).to.have.property("associated_key");
            });
        });
    });
});
