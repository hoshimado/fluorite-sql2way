/**
 * [api_v1_serial.js]
 * 
 * encoding=utf-8
 */


var express = require('express');
var router = express.Router();


var lib = require("../api/factory4require.js");
var factoryImpl = { // require()を使う代わりに、new Factory() する。
	"api_sql_enumerate" : new lib.Factory4Require("../api/grantpath/api_sql_enumerate.js")
};



// ◆Unitテストに未対応。
var responseNormal = function( res, result ){
	res.header({ // res.set(field [, value]) Aliased as res.header(field [, value]).
		"Access-Control-Allow-Origin" : "*", // JSONはクロスドメインがデフォルトNG。
		"Pragma" : "no-cacha", 
		"Cache-Control" : "no-cache",
		"Content-Type" : "application/json; charset=utf-8"
	});
	res.status(result.status).send( result.jsonData );
	res.end();
};
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
var responseAnomaly = function( res, err ){
	res.header({ // res.set(field [, value]) Aliased as res.header(field [, value]).
		"Access-Control-Allow-Origin" : "*", // JSONはクロスドメインがデフォルトNG。
		"Pragma" : "no-cacha", 
		"Cache-Control" : "no-cache",
		"Content-Type" : "application/json; charset=utf-8"
	});
	res.status(500).send( err );
	res.end();
};



// curl "http://localhost:3000/api/v1/serial/grant" -X POST -d '{"Name":"tester"}'
router.post("/grant", function(req, res){
	var api_v1_serialpath_grant = factoryImpl.api_sql_enumerate.getInstance().api_v1_serialpath_grant;
	var dataPost = req.body; // app.jsで「app.use(bodyParser.json());」してるので、bodyプロパティが使える。

	return api_v1_serialpath_grant( null, dataPost ).then((result)=>{
		responseNormal( res, result );
	}).catch((err)=>{
		responseAnomaly( res, err );
	});
});



module.exports = router;

