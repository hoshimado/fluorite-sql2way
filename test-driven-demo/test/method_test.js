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
// var hookProperty = require("../../hook-test-helper").hookProperty;

var target = require("../src/method.js");

describe("method.js", function(){
    describe("getAssociatedKey()",function () {
        var authenticateKey = target.getAssociatedKey;
        it("success to get the associated key with the base key.",function () {
            var INPUT_KEY = "元に成るキー";
            return shouldFulfilled(
                authenticateKey( INPUT_KEY )
            ).then(function (result) {
            });
        });
    })
});
