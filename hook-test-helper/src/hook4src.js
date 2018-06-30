/*
    [hook4src.js]

	encoding=utf-8
*/

/**
 * 環境変数 NODE_ENV==development の時に、指定した変数名で「外部公開設定済み」の変数を返却する。
 * 
 * @param {*}      exportsInstance Modules.exports を指定する
 * @param {String} variableName    外部公開するHookポイントの変数名を文字列で指定する。
 * @param {*}      existInstance   設定するインスタンス。省略した場合は、内部でオブジェクト{}を自動生成する。 
 */
var createHookPoint = function ( exportsInstance, variableName, existInstance ) {
	var instance = (existInstance) ? existInstance : {};
	if( process.env.NODE_ENV == "development" ){
		exportsInstance[ variableName ] = instance;
	}
	return instance;
};
exports.createHookPoint = createHookPoint;


