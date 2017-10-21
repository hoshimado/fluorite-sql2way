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
            "searchQuery": '',
            "gridColumns": ['time', 'activity'],
            "gridData": [],
            "TEXT_GETUP" : ACTIVITY.GET_UP.title,
            "TEST_GOTOBED" : ACTIVITY.GOTO_BED.title
        },
        methods : {
            "getGridData" : function() {
                var promise = client_lib.getActivityDataInAccordanceWithCookie();
                return promise.then((resultArray)=>{
                    var grid_activity_data = client_lib.convertActivityList2GridData( resultArray );
                    this.gridData = grid_activity_data.slice(0, 6);
                    // ↑カットオフ入れてる。最大６つまで、で。

                    // ↓寺家列に対して grid_activity_data は逆順（最初が最新）なので、注意。
                    return Promise.resolve( resultArray );
                }).then(( activitiyData )=>{
                    // チャートのテスト
                    chartsleeping_lib.plot2Chart( activitiyData );

                    return new Promise((resolve,reject)=>{
                        setTimeout(function() {
                            resolve();
                        }, 2000);
                    });
                });
            },
            "noticeGotUp" : function(){
                var promise = client_lib.addActivityDataInAccordanceWithCookie( ACTIVITY.GET_UP.type );
            },
            "noticeGotoBed" : function(){
                var promise = client_lib.addActivityDataInAccordanceWithCookie( ACTIVITY.GOTO_BED.type );
            }
        },
        "mounted" : function() {
            var self = this;
            setTimeout(function() {
                // 初期化の都合で、0.5秒後に実行する。【暫定】
                // ToDo：単純に「未だ準備が終わって無ければ1秒後にリトライ」が良いのでは？
                self.getGridData();
            }, 500);
        }
    });
    return app_grid;
};


var _vueAppSetup = function( createVueInstance ){
    var app_setup = createVueInstance({
        el: "#app_setup",
        data: {
            "userName": "sample@mail.address",
            "passKeyWord" : ""
        },
        methods : {
            createAccount(){
                // var promise = _promiseCreateAccount( this.userName );
                client_lib.tinyCookie( COOKIE_USER_ID, this.userName );
                client_lib.tinyCookie( COOKIE_USER_PASSWORD, this.passKeyWord );
            }
        },
        mounted : function(){
            var savedUserName = client_lib.tinyCookie( COOKIE_USER_ID );
            var savedPassKey = client_lib.tinyCookie( COOKIE_USER_PASSWORD );
            if( savedUserName != null ){
                this.userName = savedUserName;
            }
            this.passKeyWord = savedPassKey;
        }
    });
    return app_setup;
};
var COOKIE_USER_ID = "FLUORITE_LIFELOG_USERID20171017";
var COOKIE_USER_PASSWORD = "FLUORITE_LIFELOG_PASSWORD20171017";
var COOKIE_OPTIONS = {expires: "Mon, 1-Jan-2018 00:00:00 GMT"}; // ToDo：要検討

var _tinyCookie = this.window ? window.Cookie : undefined; // ブラウザ環境以外は敢えて「未定義」にしておく。
/*
    name = cookie( COOKIE_NAME + n, list[n].text, COOKIE_OPTIONS );
*/
        


// ToDo: axiosへのインスタンスをフックしておかないと、テストできない！
var _promiseCreateAccount = function( mailAddress ){
    // ToDo:これから実装
    return Promise.resolve( client_lib.axios );
};



/**
 * 動作種別の定義
 */
var ACTIVITY = {
    "GOTO_BED" : {
        "title" : "寝る",
        "type" : "101"
    },
    "GET_UP" : {
        "title" : "起きた",
        "type" : "102"
    }
};
if( !this.window ){
    exports.ACTIVITY = ACTIVITY;
}


/**
 * 動作ドメイン「azurewebsites.net/」で判別して、GMT→JST補正する。
 */
var convertGMT2JST = function( dateStr ){
    var dt;
    var TIME_ZONE = 9; // JST
    if( window && window.location && (window.location.href.indexOf("azurewebsites.net/")>0) ){
        dt = new Date( dateStr );
        dt.setHours(dt.getHours() + TIME_ZONE);
        dateStr = dt.toLocaleString();
    }
    return dateStr;
}

/**
 * 逆順で格納されるので注意（グリッドビューの表示は下→上を時系列とする）。
 */
var _convertActivityList2GridData = function( typeArray ){
    var array = typeArray; // [{ "time", "type" }]
    var n = array.length;
    var grid_activity_data = [], item;
    var localtime;
    while( 0<n-- ){
        item = array[n];
        localtime = convertGMT2JST( item.created_at );
        grid_activity_data.push({
            "time" : localtime.substr(0, 16),
            "activity" : (function( obj, type ){
                var keys = Object.keys(obj);
                var i = keys.length;
                while( 0<i-- ){
                    if( obj[ keys[i] ].type == type ){
                        return obj[ keys[i] ].title;
                    }
                }
                return "No title";
            }( ACTIVITY, item.type ))
        });
    }
    return grid_activity_data;
}


var _fake_ajax1 = function(){
    return new Promise(function(resolve,reject){
        setTimeout(function() {
            resolve({
                "data" : 
                {
                    "result":"fake ajax is is OK!",
                    "table":[
                        { "created_at" : "2017-10-13 01:00:00.000", "type" : 101 },
                        { "created_at" : "2017-10-13 06:00:00.000", "type" : 101 },
                        { "created_at" : "2017-10-13 23:45:00.000", "type" : 101 },
                        { "created_at" : "2017-10-14 08:30:20.000", "type" : 102 },
                        { "created_at" : "2017-10-14 23:30:00.000", "type" : 101 },
                        { "created_at" : "2017-10-15 06:00:20.000", "type" : 102 },
                        { "created_at" : "2017-10-16 00:38:21.000", "type" : 101 },
                        { "created_at" : "2017-10-16 06:23:57.000", "type" : 102 }
                    ]
                }        
            });
        }, 500);
    });
};
var _getActivityDataInAccordanceWithCookie = function(){
    var url = "./api/v1/activitylog/show";
    var axiosInstance = client_lib.axios;
    var promise;
    var savedUserName = client_lib.tinyCookie( COOKIE_USER_ID );
    var savedPassKey  = client_lib.tinyCookie( COOKIE_USER_PASSWORD );
    if( (savedUserName != null) && (savedUserName.length > 10) ){
console.log( "axios act!" ); // ←↑この辺は、テスト用。暫定。
        promise = axiosInstance.get(
            url,
            {
                "crossdomain" : true,
                "params" : {
                    "device_key" : savedUserName,
                    "pass_key" : savedPassKey
                }
            }
        );
    }else{
console.log( "fake_axios!" );        
        promise = _fake_ajax1();
    }
    return promise.then(function(result){
        var responsedata = result.data;
        return Promise.resolve( responsedata.table );     
    })
};
var _addActivityDataInAccordanceWithCookie = function( typeValue ){
    var url = "./api/v1/activitylog/add";
    var axiosInstance = client_lib.axios;
    var promise;
    var savedUserName = client_lib.tinyCookie( COOKIE_USER_ID );
    var savedPassKey  = client_lib.tinyCookie( COOKIE_USER_PASSWORD );
    if( (savedUserName != null) && (savedUserName.length > 10) ){
console.log( "axios act!" ); // ←↑この辺は、テスト用。暫定。
        promise = axiosInstance.post(
            url,
            { // postData
                "device_key" : savedUserName,
                "pass_key" : savedPassKey,
                "type_value" : typeValue
            }
        );
    }else{
console.log( "fake_axios!" );        
        promise = Promise.resolve({
            "data" : { 
                result: 'Success to insert ' + typeValue + ' as activitylog on Database!',
                device_key: 'xingyanhuan@yahoo.co.jp'
            }
        });
    }
    return promise.then(function(result){
        var responsedata = result.data;
console.log( responsedata );
        return Promise.resolve( responsedata );     
    })
};
// ACTIVITY で定義してる。title, type






// ----------------------------------------------------------------------
var client_lib = {
    "convertActivityList2GridData" : _convertActivityList2GridData,
    "getActivityDataInAccordanceWithCookie" : _getActivityDataInAccordanceWithCookie,
    "addActivityDataInAccordanceWithCookie" : _addActivityDataInAccordanceWithCookie,
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
        chartsleeping_lib.initialize( browserThis ); // このとき、this.document / window などが存在する。
        _vueAppGrid( CREATE_VUE_INSTANCE, client_lib, chartsleeping_lib );
        _vueAppSetup( CREATE_VUE_INSTANCE, client_lib );
    };


}else{
    // ここに来るのは、テスト時だけ。on Node.js
    exports.setVueComponentGrid = _setVueComponentGrid;
    exports.vueAppGrid = _vueAppGrid;
    exports.vueAppSetup = _vueAppSetup;
    
    exports.promiseCreateAccount = _promiseCreateAccount;
    exports.client_lib = client_lib;
}


