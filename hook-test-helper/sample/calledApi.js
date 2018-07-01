/**
 * [calledApi.js]
 * encoding=utf-8
 */


var createHookPoint = require("../src/hook4src.js").createHookPoint;
var hook = createHookPoint( exports, "hook" );

hook[ "localApi1" ] = function (params) {
    console.log("[enter localAPi1]: argv=[" + params +"]" );
};
hook[ "localApi2" ] = function (params) {
    console.log("[enter localAPi2]: argv=[" + params +"]" );
};



exports.doSomething = function ( params ) {
    console.log( "[enter doSomething]: argv=[" + params + "]" );
    hook.localApi1( "calls with" + params );
    hook.localApi2( "calls with" + params );
};


