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
var _vueAppGrid = function( createVueInstance, client_lib ){
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
                    var chartData = client_lib.convertSleepTime6MarkingTimeTwice( activitiyData );
                    var horizonArray = chartData.date;
                    var verticalArray = chartData.sleepingtime;
                    client_lib.chartInstance.show( 
                        "bar", // "line", 
                        horizonArray, 
                        [{
                            "label" : "睡眠時間",
                            data : verticalArray,
                            backgroundColor: "rgba(153,255,51,0.4)"
                        }] 
                    );
                    return new Promise((resolve,reject)=>{
                        setTimeout(function() {
                            resolve();
                        }, 2000);
                    });
                });
             
                // */
                /*
                // ACTIVITY.GOTO_BED / GET_UP
                var url = "./api/v1/activitylog/show?device_key=nyan1nyan2nyan3nayn4nayn5nyan6ny";
                axiosInstance.get(url).then(x => {
                    var TENTANATIVE = {
                        "1" : "起きた",
                        "2" : "眠い",
                        "3" : "寝る",
                        "4" : "寝落ち"
                    };
                    var array = x.data.table;
                    var n = array.length;
                    var grid_data = [], item;
                    while( 0<n-- ){
                        item = array[n];
                        grid_data.push({
                            "time" : item.created_at.substr(0, 16),
                            "activity" : TENTANATIVE[ item.type ]
                        });
                    }
                    this.gridData = grid_data;
                });
                // */
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
                var promise = _promiseCreateAccount( this.userName );
            }
        }
    });
    return app_setup;
};

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

var _CHART = function( browserThis, targetCanvasId ){
    var canvasNode = browserThis.document.getElementById( targetCanvasId );
    this._ctx = canvasNode.getContext("2d");
    this._myChart = null;
}; 
_CHART.prototype.show = function( chartType, labels, datasets ){
    if( !this._myChart ){
        this._myChart = new Chart(this._ctx, {
            "type" : chartType,
            "responsive" : true,
            "data" : {
                "labels" : labels,
                "datasets" : datasets
            },
            "options" : { // このシート見やすい⇒ https://qiita.com/masatatsu/items/a311e88f19eecd8f47ab
                "scales" : {
                    "yAxes": [{                      //y軸設定
                        "display": true,             //表示設定
                        "scaleLabel": {              //軸ラベル設定
                           // "fontSize": 18,               //フォントサイズ
                           "display": true,          //表示設定
                           "labelString": '睡眠時間'  //ラベル
                        },
                        "ticks": {                      //最大値最小値設定
                            // "fontSize": 18,             //フォントサイズ
                            "min": 0,                   //最小値
                            "max": 12,                  //最大値
                            "stepSize": 1               //軸間隔
                        },
                    }],
                }
            }
        });
    }else{
        this._myChart.type = chartType;
        this._myChart.data.labels = labels;
        this._myChart.data.datasets = datasets;
        this._myChart.update();
    }
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


var _convertSleepTime6MarkingTimeTwice = function( activitiyArray ){
    var arrayDateStr = (function( arrayWithType ){ // 時刻だけ取り出して、行動型に依存せず時間差だけを見て変換する。
        var i, n = arrayWithType.length;
        var array = [];
        for( i=0; i<n; i++ ){
            array.push( arrayWithType[i].time );
        }
        return array;
    }( activitiyArray ));
    var dateList = [];
    var elapsed1, elapsed2, elapsedMatrix = { "date" : [], "sleepingtime" : [] };
    var i, n = arrayDateStr.length;

    for(i=0; i<n; i++){
        dateList.push( new Date( arrayDateStr[i] ) );
        // console.log( dateList[i].toLocaleDateString() );
    }

    i = 0;
    n -= 2; // 先の2つを取るので、上限を２減らして置く。
    while(i < n){
        elapsed1 = dateList[i+1] - dateList[i];
        elapsed2 = dateList[i+2] - dateList[i+1];
        if( elapsed1 < elapsed2 ){ // 前後の値で「前が小さい」なら、それを「終端」として拾う。
            elapsedMatrix.date.push( dateList[i+1].toLocaleDateString() );
            elapsedMatrix.sleepingtime.push( elapsed1 /1000 /3600 );
        }
        i++; // ここでカウントアップする。
        if( i == n ){ // カウントアップ後の最後のデータが「終端」なら追加する。
            elapsedMatrix.date.push( dateList[i+1].toLocaleDateString() );
            elapsedMatrix.sleepingtime.push( elapsed2 /1000 /3600 );
        }
    }
    // dt1.toLocaleString()

    return elapsedMatrix;
};



// ----------------------------------------------------------------------
var client_lib = {
    "convertSleepTime6MarkingTimeTwice" : _convertSleepTime6MarkingTimeTwice,
    "convertActivityList2GridData" : _convertActivityList2GridData,
    "getActivityDataInAccordanceWithCookie" : _getActivityDataInAccordanceWithCookie
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
        client_lib["chartInstance"] = (browserThis.window) ? new _CHART(browserThis, "id_chart") : {}; // ダミー

        _setVueComponentGrid( Vue );
        _vueAppGrid( CREATE_VUE_INSTANCE, client_lib );
        _vueAppSetup( CREATE_VUE_INSTANCE );
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


