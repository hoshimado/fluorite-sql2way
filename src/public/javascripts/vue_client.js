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
var _vueAppGrid = function( createVueInstance ){
    var app_grid = createVueInstance({
        el: '#app_grid',
        data: {
            searchQuery: '',
            gridColumns: ['time', 'activity'],
            gridData: []
        },
        methods : {
            getGridData() {
                ///*
                var promise = new Promise((resolve,reject)=>{
                    setTimeout(function() {
                        resolve({
                            "data" : 
                            [
                                { time: "2017-09-29 07:20",  activity: '起きた' },
                                { time: "2017-09-30 01:55",  activity: '寝る' },
                                { time: "2017-09-30 05:55",  activity: '起きた'},
                                { time: "2017-09-30 18:00",  activity: '眠い' }
                            ]
                        });
                    }, 500);
                });
                promise.then((response)=>{
                    this.gridData = response.data;
                });
                // */
                /*
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
        mounted() {
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

var _vueAppAxios = function( createAccount, axiosInstance ){
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
        }
    });
    return app_axios;
};


// ToDo: axiosへのインスタンスをフックしておかないと、テストできない！
var _promiseCreateAccount = function( mailAddress ){
    // ToDo:これから実装
    return Promise.resolve( client_lib.axios );
};


// ----------------------------------------------------------------------
client_lib = {
    "axios" : (this.window) ? axios : {} // ダミー
};

// typeof window !== 'undefined'
if( this.window ){
    // ブラウザ環境での動作
    var CREATE_VUE_INSTANCE = function(options){
        return new Vue(options);
    };
    window.onload = function(){
        _setVueComponentGrid( Vue );
        _vueAppGrid( CREATE_VUE_INSTANCE );
        _vueAppSetup( CREATE_VUE_INSTANCE );
        _vueAppAxios( CREATE_VUE_INSTANCE, axios )
    };
}else{
    // ここに来るのは、テスト時だけ。on Node.js
    exports.setVueComponentGrid = _setVueComponentGrid;
    exports.vueAppGrid = _vueAppGrid;
    exports.vueAppSetup = _vueAppSetup;
    
    exports.promiseCreateAccount = _promiseCreateAccount;
    exports.client_lib = client_lib;
}


