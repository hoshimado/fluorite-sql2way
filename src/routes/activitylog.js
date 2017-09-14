/**
 * [activitylog.js]
 * 
 * encoding=utf-8
 */


var express = require('express');
var router = express.Router();

var lib = require("../ztrial/factory4require.js");
var factoryImpl = { // require()を使う代わりに、new Factory() する。
    "api_sql" : new lib.Factory4Require("../ztrial/sql_lite_db.js")
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
  var createPromiseForSqlConnection = factoryImpl.api_sql.getInstance().createPromiseForSqlConnection;
  var closeConnection = factoryImpl.api_sql.getInstance().closeConnection;
  var getListOfActivityLogWhereDeviceKey = factoryImpl.api_sql.getInstance().getListOfActivityLogWhereDeviceKey;

  var outJsonData = { "sample":"Hello World !" };
  var inputDataObj = {
    "device_key" : "nyan1nyan2nyan3nayn4nayn5nyan6ny"
  };
  var sqlConfig = {
    database : "./db/mydb.sqlite3"
  };
  var promise = createPromiseForSqlConnection( outJsonData, inputDataObj, sqlConfig );
  promise = promise.then( function(result){
    return getListOfActivityLogWhereDeviceKey( sqlConfig.database, "nyan1nyan2nyan3nayn4nayn5nyan6ny", null );
  }).then( function( result ){
    outJsonData[ "result" ] = result;
    closeConnection( sqlConfig.database );
  }).then( function(){
    res.header('Content-Type', 'application/json; charset=utf-8')
    res.send(outJsonData);
  }).catch( function(){
    res.header('Content-Type', 'application/json; charset=utf-8')
    res.send(outJsonData);
  });
});

module.exports = router;






  