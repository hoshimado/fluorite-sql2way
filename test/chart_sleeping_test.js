/**
 * [chart_sleeping_test.js]
    encoding=utf-8
 */

var chai = require("chai");
var assert = chai.assert;
var expect = chai.expect;
var sinon = require("sinon");
var promiseTestHelper = require("promise-test-helper");
var shouldFulfilled = promiseTestHelper.shouldFulfilled;
var target = require("../src/public/javascripts/chart_sleeping.js");


describe("TEST for chart_sleeping.js", function(){
    this.timeout( 5000 );
    var stub_vue, stub_static_vue, stub_axios;
	var original;
	beforeEach(()=>{ // フック前の関数を保持する。
		original = { 
            "convertSleepTime6MarkingTimeTwice" : target.hook.convertSleepTime6MarkingTimeTwice
        };
	});
	afterEach(()=>{ // フックした（かもしれない）関数を、元に戻す。
        target.hook.convertSleepTime6MarkingTimeTwice = original.convertSleepTime6MarkingTimeTwice;
	});


    describe("::convertSleepTime6MarkingTimeTwice()",function(){
        it("夜スタート朝終わりのケース",function(){
            var convertSleepTime6MarkingTimeTwice = target.hook.convertSleepTime6MarkingTimeTwice;
            var result = convertSleepTime6MarkingTimeTwice([
                { "time" : "2017-10-13 23:45", "activity" : 101 },
                { "time" : "2017-10-14 08:30", "activity" : 102 },
                { "time" : "2017-10-14 23:30", "activity" : 101 },
                { "time" : "2017-10-15 06:00", "activity" : 102 },
                { "time" : "2017-10-16 01:00", "activity" : 101 },
                { "time" : "2017-10-16 07:00", "activity" : 102 }
            ]);

            expect(result).to.has.property("date");
            expect(result).to.has.property("sleepingtime");
            expect(result.date).to.deep.equal([
                "2017-10-14",
                "2017-10-15",
                "2017-10-16"
            ]);
            expect(result.sleepingtime).to.deep.equal([
                8.75,
                6.5,
                6
            ]);
        });
    });
    describe("::plot2Chart()",function(){
        it("データ加工後に、chart.jsをラッパーした_Chart.show()を呼び出す",function(){
            var plot2Chart = target.plot2Chart;
            var stub_convertSleepTime6MarkingTimeTwice = sinon.stub();
            var stub_chartShow = sinon.stub(); // _CHART() に対してstubするべきかもだが。。。
            var EXPECTED_CHART_DATA = {
                "date" : ["ふが"],
                "sleepingtime" : ["ほげ"]
            };
            var INPUT_DATA = { "dummy" : "ぴよ" };

            stub_convertSleepTime6MarkingTimeTwice.onCall(0)
            .returns( EXPECTED_CHART_DATA );
            target.hook.convertSleepTime6MarkingTimeTwice = stub_convertSleepTime6MarkingTimeTwice;

            target.hook.chartInstance = {
                "show" : stub_chartShow
            };

            plot2Chart( INPUT_DATA );
            assert( stub_convertSleepTime6MarkingTimeTwice.calledOnce );
            assert( stub_chartShow.calledOnce )
            expect( stub_chartShow.getCall(0).args[1] ).to.equal( EXPECTED_CHART_DATA.date );
            expect( stub_chartShow.getCall(0).args[2]).to.deep.equal([{
                "label" : "睡眠時間",
                "data" : EXPECTED_CHART_DATA.sleepingtime,
                "backgroundColor": "rgba(153,255,51,0.4)"
            }]);
        });
    });
});


