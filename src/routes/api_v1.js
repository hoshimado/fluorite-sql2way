/**
 * [api_v1.js]
 * 
 * encoding=utf-8
 */


var express = require('express');
var router = express.Router();

var lib = require("../api/factory4require.js");
var factoryImpl = { // require()を使う代わりに、new Factory() する。
    "sql_lite_db" : new lib.Factory4Require("../api/activitylog.js")
};



/* サンプルAPI① 
 * http://localhost:3000/samples にGETメソッドのリクエストを投げると、
 * JSON形式で文字列を返す。
 */
router.get('/', function(req, res, next) {
  var param = {"値":"これはサンプルAPIです"};
  res.header('Content-Type', 'application/json; charset=utf-8')
  res.send(param);
});



/* サンプルAPI② 
  * http://localhost:3000/samples/hello にGETメソッドのリクエストを投げると、
  * JSON形式で文字列を返す。
  */
router.get('/show', function(req, res, next) {
	var api_v1_activitylog_show = factoryImpl.sql_lite_db.getInstance().api_v1_activitylog_show;

console.log( "[/show]" );
	
	return api_v1_activitylog_show(req.query, null ).then((result)=>{
console.log( result );

		res.header({ // res.set(field [, value]) Aliased as res.header(field [, value]).
			"Access-Control-Allow-Origin" : "*", // JSONはクロスドメインがデフォルトNG。
			"Pragma" : "no-cacha", 
			"Cache-Control" : "no-cache",
			"Content-Type" : "application/json; charset=utf-8"
		});
		res.status(result.status).send( result.jsonData );
		res.end();
/*
    //res.jsonp([body])
	if( this.itsCallBackName ){
		// http://tsujimotter.info/2013/01/03/jsonp/
		data = this.itsCallBackName + "(" + data + ")";
		this.writeHead( httpStatus, { 
			"Pragma" : "no-cacha", 
			"Cache-Control" : "no-cache",
			"Content-Type" : "application/javascript; charset=utf-8"
		});
	}
*/
	}).catch((err)=>{
		res.header({ // res.set(field [, value]) Aliased as res.header(field [, value]).
			"Access-Control-Allow-Origin" : "*", // JSONはクロスドメインがデフォルトNG。
			"Pragma" : "no-cacha", 
			"Cache-Control" : "no-cache",
			"Content-Type" : "application/json; charset=utf-8"
		});
		res.status(500).send( err );
		res.end();
	});
});

module.exports = router;

