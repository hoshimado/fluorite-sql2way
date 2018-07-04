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

var target = require("../src/method.js");

describe("method.js", function(){
    describe("getAssociatedKey()",function () {
        var authenticateKey = target.getAssociatedKey;
        var hooked = {}, stub_sqlite3;
        var STUB_DATABASE = function (databaseName, callback) {
            this._dateBaseName = databaseName;
            setTimeout(() => {
                callback(); // 成功版なので、引数無し。
            }, 100);
        };
        STUB_DATABASE.prototype.all = function (queryStr, paramsArray, callback) {
            // callback(err, rows)
        };
        STUB_DATABASE.prototype.close = function (callback) {
            // callback(err);
        };

        beforeEach(function () {
            stub_sqlite3 = {
                "Database" : STUB_DATABASE
            };
            hooked["sqlite3"] = hookProperty(target.sqlite3,stub_sqlite3);
        });
        afterEach(function () {
            hooked["sqlite3"].restore();
        })
        it("success to get the associated key with the base key.",function () {
            var INPUT_KEY = "元に成るキー";

            return shouldFulfilled(
                authenticateKey( INPUT_KEY )
            ).then(function (result) {
                expect(result).to.have.property("associated_key");
            });
        });
    })
});
