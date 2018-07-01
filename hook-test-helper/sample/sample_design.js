/**
 * [sample_design.js]
 * encoding=utf-8
 */

var createHookPoint = require("../src/hook4src.js").createHookPoint;
var hook = createHookPoint(exports, "hook");

hook["open"] = function(){
    // ここは未実装。
    return Promise.reject();
};
hook["doSomething"] = function () {
    // ここは未実装。
    return Promise.reject();
};
hook["close"] = function() {
    // ここは未実装。
    return Promise.reject();
};

// これだけ実装。
exports.method1 = function(keyword) {
    var value = {};
    return hook.open(keyword).then(function (handle) {
        return hook.doSomething(handle);
    }).then(function (result) {
        value = result;
        return hook.close();
    }).then(function(){
        return Promise.resolve(value)
    });
};

