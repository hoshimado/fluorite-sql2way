/**
 * [chart_sleeping.js]
    encoding=utf-8
 */


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


var _plot2Chart = function( activitiyData ){
    var chartData = _chart_hook.convertSleepTime6MarkingTimeTwice( activitiyData );
    var horizonArray = chartData.date;
    var verticalArray = chartData.sleepingtime;
    _chart_hook.chartInstance.show( 
        "bar", // "line", 
        horizonArray, 
        [{
            "label" : "睡眠時間",
            data : verticalArray,
            backgroundColor: "rgba(153,255,51,0.4)"
        }] 
    );
};


var chartsleeping_lib = {
    "plot2Chart" : _plot2Chart,
};
var _chart_hook = {
    "convertSleepTime6MarkingTimeTwice" : _convertSleepTime6MarkingTimeTwice,
    "chartInstance" : {} // ダミー
};
if( this.window ){
    /**
     * window.onload() のタイミングで実施するため、vue_client.js側でこれを呼び出す。
     * @param{Object} browserThis ブラウザのthisインスタンスを渡す。
     */
    chartsleeping_lib["initialize"] = function( browserThis ){
        _chart_hook.chartInstance = new _CHART( browserThis, "id_chart" );
    };
}else{
    exports.hook = _chart_hook;
    exports.plot2Chart = _plot2Chart;
}



