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
    app.directive('reportColumn', [
        'reportService', function (reportService) {

            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'index/custom/report-column-directive.htm',
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
                    // 默认全部
                    scope.chartType = 'all';

                    /**
                     *柱状图/折线图切换
                    */
                    scope.changeChartType = function (type) {
                        scope.chartType = type;
                        scope.getLineColumData();
                    };

                    var xAxisCate;
                    var seriesArray;

                    /**
                     *处理结果数据为表格图表展示格式
                    */
                    var dealdata = function (data) {
                        xAxisCate = [];
                        seriesArray = [];
                        for (var i = 0; i < scope.contentParam.chartParams.mainAxis.length; i++) {
                            var axis = scope.contentParam.chartParams.mainAxis[i];
                            var item = {};
                            item.name = axis.text;
                            item.filed = axis.measure;

                            item.yAxis = 0;
                            if (scope.chartType === 'all') {
                                item.type = axis.chartType;
                            }
                            else {
                                item.type = scope.chartType;
                            }
                            item.data = [];
                            seriesArray.push(item);
                        }

                        for (var i = 0; i < scope.contentParam.chartParams.secondaryAxis.length; i++) {
                            var axis = scope.contentParam.chartParams.secondaryAxis[i];
                            var item = {};
                            item.name = axis.text;
                            item.filed = axis.measure;
                            if (scope.chartType === 'all') {
                                item.type = axis.chartType;
                            }
                            else {
                                item.type = scope.chartType;
                            }
                            item.data = [];
                            item.yAxis = 1;
                            seriesArray.push(item);
                        }

                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            if ($.inArray(item.xAxis, xAxisCate) < 0) {
                                xAxisCate.push(item.xAxis);
                            }

                            var index = scope.$parent.myInArray(seriesArray, 'filed', item.filed);
                            seriesArray[index].data.push(item.value);
                        }
                    };

                    /**
                     *画图表
                    */
                    var drawChart = function (data) {
                        dealdata(data);
                        chart = new Highcharts.Chart({
                            chart: {
                                renderTo: 'lineChartColumnData_' + scope.index,
                                zoomType: 'xy',
                                backgroundColor: '#fff',
                                color: '#838d96'
                            },
                            exporting: {
                                enabled: false
                            },
                            colors: [
                                '#049ae3', '#f9e893', '#ebebc2', '#9bd553', '#149ab8',
                                '#d6cc10', '#e5e07f', '#bbe882', '#3dadcd', '#0e7b93'
                            ],
                            title: {
                                text: ''
                            },
                            credits: {
                                enabled: false
                            },
                            loading: false,
                            plotOptions: {
                                column: {
                                    borderWidth: '0', // 去边框
                                    shadow: false // 去阴影
                                }
                            },
                            xAxis: [{
                                categories: xAxisCate,
                                labels: {
                                    style: {
                                        color: '#838d96'
                                    },
                                    formatter: function () {
                                        if (scope.contentParam.chartParams.xAxis === 'brand' || scope.contentParam.chartParams.xAxis === 'voiceId' || scope.contentParam.chartParams.xAxis === 'taskId') {
                                            var xData = this.value.length > 8 ? this.value.substring(0, 8) + '...' : this.value;
                                            return xData;
                                        }

                                        return this.value;

                                    }
                                },
                                tickWidth: 0,
                                lineColor: '#efefef',
                                lineWidth: 2,
                                tickInterval: xAxisCate.length > 3 ? 3 : 1
                            }],
                            yAxis: [{
                                labels: {
                                    style: {
                                        color: '#89A54E'
                                    }
                                },
                                title: {
                                    text: '',
                                    style: {
                                        color: '#89A54E'
                                    }
                                },
                                gridLineColor: '#f1f1f1',
                                gridLineWidth: 2,
                                lineColor: '#fff',
                                lineWidth: 2
                            }, {
                                title: {
                                    text: '',
                                    style: {
                                        color: '#28CFCF'
                                    }
                                },
                                gridLineColor: '#f1f1f1',
                                gridLineWidth: 2,
                                lineColor: '#fff',
                                lineWidth: 2,
                                labels: {
                                    style: {
                                        color: '#20a8ff'
                                    }
                                },
                                opposite: true
                            }],
                            tooltip: {
                                headerFormat: '<span style="font-size:10px;width:200px;">{point.key}</span><br/>',
                                shared: true,
                                useHTML: true
                            },
                            legend: {
                                backgroundColor: '#FFFFFF'
                            },
                            series: seriesArray
                        });
                    };

                    /**
                     *获取柱状图或折线图数据
                    */
                    scope.getLineColumData = function () {
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
                        reportService.getLineColumData(params)
                            .then(function (result) {
                                drawChart(result.value);
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
                    scope.$on('repostColumnData', function (event, data) {
                        scope.contentParam.chartParams.order = data.timeDimKey;
                        scope.contentParam.chartParams.xAxis = data.timeDimKey;
                        scope.contentParam.chartParams.timeDimKey = data.timeDimKey;
                        scope.contentParam.chartParams.timeDimText = data.timeDimText;
                        scope.getLineColumData();
                    });

                    scope.getLineColumData();
                }

            };
        }]);
});
