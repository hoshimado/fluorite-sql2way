/**
 * [activitylog.js]
 * 
 * encoding=utf-8
 */


var express = require('express');
var router = express.Router();


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
    var param = {"result":"Hello World !"};
    res.header('Content-Type', 'application/json; charset=utf-8')
    res.send(param);
  });
  
  module.exports = router;


  