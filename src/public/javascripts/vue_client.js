/**
 * [vue_client.js]
    encoding=utf-8
 */


var setupVue = function( createVueInstance, staticVue, axiosInstance ){
    // register the grid component
    staticVue.component('demo-grid', {
        template: '#grid-template',
        props: {
            data: Array,
            columns: Array,
            filterKey: String
        },
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
        computed: {
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
        }
    });
  
    // bootstrap the demo
    var app_grid = createVueInstance({
        el: '#app_grid',
        data: {
            searchQuery: '',
            gridColumns: ['time', 'activity'],
            gridData: []
        },
        methods : {
            getGridData() {
                /*
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
                */
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
            }
        },
        mounted() {
            this.getGridData();
        }
    })


    var app = createVueInstance({
        el: '#axios_sample',
        data: {
          characters: []
        },
        methods: {
          getCharacters() {
            var url = 'https://gist.githubusercontent.com/anonymous/c41ae1698aca3595b95d1496ebf42d83/raw/2addeb281bcb4aae2be9c8204c0ec623c4cb446c/characters.json';
            axiosInstance.get(url).then(x => { this.characters = x.data; });
          }
        },
        mounted() {
          this.getCharacters();
        }
    });

};


if( typeof window !== 'undefined' ){
    var CREATE_VUE_INSTANCE = function(options){
        return new Vue(options);
    };
    window.onload = function(){
        setupVue( CREATE_VUE_INSTANCE, Vue, axios );
    };
}else{
    exports.setupVue = setupVue;
}


