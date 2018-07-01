/*
    [index.js]
    encoding=UTF8
*/

process.env.NODE_ENV = "development";

var sample = require("./sample/localFunctionHookSample.js");

sample.method1();
console.log("---");

sample.method2();
console.log("---");

