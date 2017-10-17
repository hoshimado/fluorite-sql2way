/**
 * [vue_client.js]
    encoding=utf-8
 */



var _setVueComponentGrid = function( staticVue ){
    // register the grid component
    staticVue.component('vue-my-element-grid', {
        template: '#grid-template',
        props: {
            // filterKey: String,
            data: Array,
            columns: Array
        },
        /* // コンスタラクタで初期化するprops、と見なせばよい。
        data: function () {
            var sortOrders = {}
            this.columns.forEach(function (key) {
                sortOrders[key] = 1
            })
            return {
                sortKey: '',
                sortOrders: sortOrders
            }
        },
        */
        computed: {
            /*
            filteredData: function () {
                var sortKey = this.sortKey
                var filterKey = this.filterKey && this.filterKey.toLowerCase()
                var order = this.sortOrders[sortKey] || 1
                var data = this.data
                if (filterKey) {
                    data = data.filter(function (row) {
                        return Object.keys(row).some(function (key) {
                        return String(row[key]).toLowerCase().indexOf(filterKey) > -1
                        })
                    })
                }
                if (sortKey) {
                    data = data.slice().sort(function (a, b) {
                        a = a[sortKey]
                        b = b[sortKey]
                        return (a === b ? 0 : a > b ? 1 : -1) * order
                    })
                }
                return data
            }
            */
            filteredData : function() {
                return this.data;
            }
        /*
        },
        filters: {
            capitalize: function (str) {
                return str.charAt(0).toUpperCase() + str.slice(1)
            }
        },
        methods: {
            sortBy: function (key) {
                this.sortKey = key
                this.sortOrders[key] = this.sortOrders[key] * -1
            }
        */
        }
    });
};  
var _vueAppGrid = function( createVueInstance, client_lib, chartsleeping_lib ){
    var app_grid = createVueInstance({
        el: '#app_grid',
        data: {
            searchQuery: '',
            gridColumns: ['time', 'activity'],
            gridData: []
        },
        methods : {
            getGridData() {
                var promise = client_lib.getActivityDataInAccordanceWithCookie();
                promise.then((resultArray)=>{
                    var grid_activity_data = client_lib.convertActivityList2GridData( resultArray );
                    this.gridData = grid_activity_data.slice(0, 4);
                    // ↑カットオフ入れてる。最大４つまで、で。

                    // ↓寺家列に対して grid_activity_data は逆順（最初が最新）なので、注意。
                    return Promise.resolve( grid_activity_data.reverse() );
                }).then(( activitiyData )=>{
                    // チャートのテスト
                    chartsleeping_lib.plot2Chart( activitiyData );

                    return new Promise((resolve,reject)=>{
                        setTimeout(function() {
                            resolve();
                        }, 2000);
                    });
                });
            }
        },
        "mounted" : function() {
            this.getGridData();
        }
    });
    return app_grid;
};


var _vueAppSetup = function( createVueInstance ){
    var app_setup = createVueInstance({
        el: "#app_setup",
        data: {
            userName: "sample@mail.address"
        },
        methods : {
            createAccount(){
                // var promise = _promiseCreateAccount( this.userName );
                client_lib.tinyCookie( COOKIE_USER_ID, this.userName );
            }
        },
        mounted : function(){
            var savedUserName = client_lib.tinyCookie( COOKIE_USER_ID );
            if( savedUserName != null ){
                this.userName = savedUserName;
            }
        }
    });
    return app_setup;
};
var COOKIE_USER_ID = "FLUORITE_LIFELOG_USERID20171017";
var COOKIE_USER_PASSWORD = "FLUORITE_LIFELOG_PASSWORD20171017";
var COOKIE_OPTIONS = {expires: 7};

var _tinyCookie = this.window ? window.Cookie : undefined; // ブラウザ環境以外は敢えて「未定義」にしておく。
/**
 * Cookieを利用したデータ保存。
 *
 */
/*
"tinyCookie" : new Factory( this.window ? window.Cookie : undefined ) 
function Cookie(key, value, opts) {
    if (value === void 0) {
      return Cookie.get(key);
    } else if (value === null) {
      Cookie.remove(key);
    } else {
      Cookie.set(key, value, opts);
    }
  }
var MAX_LISTS = 7;
var COOKIE_NAME  = "AzBatteryLog_Text";
var COOKIE_VALUE = "AzBatteryLog_Value";
var COOKIE_LAST_VALUE = "AzBatteryLog_LastValue";
var COOKIE_OPTIONS = {expires: 7};
var _loadItems = function(){
	var cookie = factoryCkImpl.tinyCookie.getInstance();
	var list = [];
	var name, value, n = MAX_LISTS;
	while( 0 < n-- ){
		name = cookie( COOKIE_NAME + n );
		value = cookie( COOKIE_VALUE + n );
		if( name && value ){
			list.push({
				"text" : name,
				"value" : value
			});
		}
	}
	return list;
};
var cookie = factoryCkImpl.tinyCookie.getInstance();
        name = cookie( COOKIE_NAME + n, list[n].text, COOKIE_OPTIONS );
        value = cookie( COOKIE_VALUE + n, list[n].value, COOKIE_OPTIONS );
*/
        
var _vueAppAxios = function( createVueInstance, axiosInstance ){
    var app_axios = createVueInstance({
        el: '#app_axios',
        data: {
            axiosQuery: 'SomethingToSend'
        },
        methods : {
            getUsers() {
                var query = this.axiosQuery;
                var queryGet = {
                    "hoge" : query
                };
                var url = "./api/v1/activitylog/test";
                axiosInstance.get(
                        url,
                    {
                        "crossdomain" : true,
                        "params" : queryGet
                    }
                ).then(x => {
                    var response = x.data;
                    console.log( response );
                });
            },
            putUsers() {
                var query = this.axiosQuery;
                var postData = {
                    "hoge" : query
                };
                var url = "./api/v1/activitylog/test";
                axiosInstance.post(
                    url,
                    postData
                ).then(x => {
                    var response = x.data;
                    console.log( response );
                });
                // あれ？クロスドメインの許可は？？？
            }
        },
    });
    return app_axios;
};


// ToDo: axiosへのインスタンスをフックしておかないと、テストできない！
var _promiseCreateAccount = function( mailAddress ){
    // ToDo:これから実装
    return Promise.resolve( client_lib.axios );
};




var _fake1 = function(){
    return Promise.resolve({
        "data" : 
        {
            "result":"sql connection is OK!",
            "table":[
                {"created_at":"2017-10-16 00:38:21.000","type":101},
                {"created_at":"2017-10-16 06:23:57.000","type":102},
                {"created_at":"2017-10-16 23:52:46.000","type":101},
                {"created_at":"2017-10-17 06:41:23.000","type":102}
            ]
        }        
    });
};
var _getActivityDataInAccordanceWithCookie = function(){
    return new Promise(function(resolve,reject){
        setTimeout(function() {
            resolve([
                { "created_at" : "2017-10-13 01:00:00.000", "type" : 101 },
                { "created_at" : "2017-10-13 06:00:00.000", "type" : 101 },
                { "created_at" : "2017-10-13 23:45:00.000", "type" : 101 },
                { "created_at" : "2017-10-14 08:30:20.000", "type" : 102 },
                { "created_at" : "2017-10-14 23:30:00.000", "type" : 101 },
                { "created_at" : "2017-10-15 06:00:20.000", "type" : 102 },
                { "created_at" : "2017-10-16 00:38:21.000", "type" : 101 },
                { "created_at" : "2017-10-16 06:23:57.000", "type" : 102 }
            ]);
        }, 500);
    });
}



var _convertActivityList2GridData = function( typeArray ){
    var MESSAGE_LIST = {
        "101" : "寝る",
        "102" : "起きた"
    };
    var array = typeArray; // [{ "time", "type" }]
    var n = array.length;
    var grid_activity_data = [], item;
    while( 0<n-- ){
        item = array[n];
        grid_activity_data.push({
            "time" : item.created_at.substr(0, 16),
            "activity" : MESSAGE_LIST[ item.type ]
        });
    }
    return grid_activity_data;
}
// var ACTIVITY = {
//    "GOTO_BED" : 101,
//    "GET_UP" : 102
// }; [define_activity.js]





// ----------------------------------------------------------------------
var client_lib = {
    "convertActivityList2GridData" : _convertActivityList2GridData,
    "getActivityDataInAccordanceWithCookie" : _getActivityDataInAccordanceWithCookie,
    "tinyCookie" : _tinyCookie
};

// typeof window !== 'undefined'
if( this.window ){
    // ブラウザ環境での動作
    var CREATE_VUE_INSTANCE = function(options){
        return new Vue(options);
    };
    var browserThis = this;
    window.onload = function(){
        client_lib["axios"] = (browserThis.window) ? axios : {}; // ダミー

        _setVueComponentGrid( Vue );
        chartsleeping_lib.initialize( this ); // このとき、this.document / window などが存在する。
        _vueAppGrid( CREATE_VUE_INSTANCE, client_lib, chartsleeping_lib );
        _vueAppSetup( CREATE_VUE_INSTANCE, client_lib );
        _vueAppAxios( CREATE_VUE_INSTANCE, client_lib.axios )

    };


}else{
    // ここに来るのは、テスト時だけ。on Node.js
    exports.setVueComponentGrid = _setVueComponentGrid;
    exports.vueAppGrid = _vueAppGrid;
    exports.vueAppSetup = _vueAppSetup;
    
    exports.promiseCreateAccount = _promiseCreateAccount;
    exports.client_lib = client_lib;
}


