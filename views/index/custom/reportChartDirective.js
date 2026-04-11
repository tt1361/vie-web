/**
 * 本文件实现依赖任何一个 Angular 的module, 如果不采用本系统的框架，
 *      可以可以在  factory(window.app) app 修改你所创建的模块名称
 *  @dependece: Angular Module
 *
 */

(function (factory) {
    if (typeof define === 'function' && !!define.amd) {
        define([
            'app'
        ], factory);
    }
    else {
        factory(window.app);
    }
})(function (app) {
    app.directive('reportChart', ['reportService', function (reportService) {

        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/custom/report-chart-directive.htm',
            scope: {
                item: '=',
                index: '@'
            },
            link: function (scope, element, attrs) {
                // 获取参数
                scope.contentParam = scope.item.contentParam ? eval('(' + scope.item.contentParam + ')') : {};
                // 获取时间类型
                scope.timeType = scope.contentParam.timeType ? scope.contentParam.timeType : 2;
                // 获取时间值
                scope.timeValue = scope.contentParam.timeValue ? scope.contentParam.timeValue : -7;
                // 获取时间区间
                scope.time = scope.$parent.getTimeText(scope.timeType, scope.timeValue) || {};
                // 自定义时间获取自然时间
                if (scope.timeType === 3 || scope.timeType === 1) {
                    // 开始时间
                    scope.time.start = scope.contentParam.startTime;
                    // 结束时间
                    scope.time.end = scope.contentParam.endTime;
                }

                // 增加显示时间区间精确到时分秒，leichen13@20171229
                var range = scope.contentParam.startTime;
                if (scope.time.end && scope.timeValue != -1 && scope.timeValue != 1) {
                    range += '至' + scope.contentParam.endTime;
                }

                scope.time.timeRange = range;

                /**
                 *数据处理
                */
                var dealdata = function (data) {
                    // console.log(data)
                    var dataList = [];
                    // 石勇 新增 判断data值是否存在
                    if (data) {
                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            var dataListItem = [];
                            dataListItem.push(String(item.legend));
                            dataListItem.push(item.value);
                            dataList.push(dataListItem);
                        }
                    }

                    return dataList;
                };

                var chart;
                Highcharts.setOptions({
                    lang: {
                        resetZoom: '重置',
                        resetZoomTitle: '重置缩放比例'
                    }
                });
                var drawChart = function (data) {
                    var dataList = dealdata(data);
                    chart = new Highcharts.Chart({
                        chart: {
                            renderTo: 'index-chart_' + scope.index,
                            plotBackgroundColor: '#fff',
                            margin: 0,
                            plotBorderWidth: 0,
                            plotShadow: false
                        },
                        exporting: {
                            enabled: false
                        },
                        colors: ['#91c153', '#bc2625', '#e97739', '#efbe47', '#fee04e',
                            '#867318', '#b07817', '#f39d09', '#69d31a', '#ae561b', '#22ddd2'
                        ],
                        title: {
                            text: ''
                        },
                        tooltip: {
                            pointFormat: '<div class="pie-tooltip">{series.name}: <b>{point.y}({point.percentage:.1f}%)</b></div>'
                        },
                        credits: {
                            enabled: false
                        },
                        loading: false,
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                borderWidth: 0,
                                center: ['50%', '50%'],
                                dataLabels: {
                                    enabled: true,
                                    style: {
                                        fontSize: '16px',
                                        textShadow: null,
                                        fontWeight: 'normal'
                                    },
                                    connectorWidth: 2,
                                    formatter: function () {
                                        var text = this.point.name.length > 4 ? this.point.name.substring(0, 4) + '...' : this.point.name;
                                        return '<span style="font-size:12px;">' + text + '</span>';
                                    }
                                }
                            }
                        },
                        series: [{
                            type: 'pie',
                            name: scope.contentParam.chartParams.text,
                            data: dataList
                        }]
                    });
                    scope.contentParam.chartParams.svg = chart.getSVG();
                };

                /**
                 *获取饼图数据
                */
                scope.getPieData = function () {
                    var params = {
                        timeType: scope.timeType,
                        timeValue: scope.timeValue,
                        startTime: scope.time.start,
                        endTime: scope.time.end,
                        chartParams: JSON.stringify(scope.contentParam.chartParams)
                    };

                    /*石勇 新增 增加默认传值*/
                    if (params.startTime.length < 11) {
                        params.startTime = params.startTime + ' 00:00:00';
                        params.endTime = params.endTime + ' 23:59:59';
                    }

                    // 
                    reportService.getPieData(params)
                        .then(function (result) {
                            drawChart(result.value.data);
                        });
                };

                /**
                 *删除模块
                */
                scope.delModel = function () {
                    scope.$emit('delPageMudle', {id: scope.item.id, index: scope.index});
                };

                /**
                 *时间排序切换
                */
                scope.$on('repostChartData', function (event, data) {
                    scope.contentParam.chartParams.timeDimKey = data.timeDimKey;
                    scope.contentParam.chartParams.timeDimText = data.timeDimText;
                    scope.contentParam.chartParams.legend = data.timeDimKey;
                    scope.getPieData();
                });

                scope.getPieData();
            }

        };
    }]);
});
