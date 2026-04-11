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
    app.directive('analysisChart', ['reportService', '$timeout', function (reportService, $timeout) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/custom/analysis-chart-directive.htm',
            transclude: true,
            scope: {
                item: '=',
                index: '@'
            },
            link: function (scope, element, attrs) {
                // 用于接受维度参数
                scope.xSelectList = [];

                scope.allShow = true;

                scope.xSelected = '按时',

                scope.ySelected = '呼叫量_求和',

                scope.axisShow = false;
                // y下拉列表隐藏
                scope.yOtionShow = false;
                // x，y选中状态
                // 处理结果数据为表格图表展示格式
                scope.xSelect = [{
                    name: '按时',
                    key: 'hour'
                }, {
                    name: '按日',
                    key: 'day'
                }, {
                    name: '按周',
                    key: 'weekOfYear'
                }];

                /**
                 *  获取初始值
                */
                scope.getParams = function () {
                    scope.xSelectKey = scope.item.xDimension;
                    scope.ySelectKey = scope.item.yDimension;
                    scope.chartType = scope.item.isChart ? 'line' : 'column';
                    scope.xSelectList = eval('(' + scope.item.chartDimensions + ')');
                    var isSelect = false;
                    angular.forEach(scope.xSelect, function (item) {
                        if (item.key === scope.xSelectKey) {
                            scope.xSelected = item.name;
                            isSelect = true;
                            return;
                        }

                    });

                    if (!isSelect) {
                        angular.forEach(scope.xSelectList, function (item) {
                            if (item.key === scope.xSelectKey) {
                                scope.xSelected = item.name;
                                return;
                            }

                        });
                    }

                };

                /**
                 * 数据处理
                */
                var dealdata = function (data) {
                    xAxisCate = [];
                    innArray = [];
                    seriesArray = [];
                    chartData = data.value;
                    for (var i = 0; i < chartData.length; i++) {
                        var item = chartData[i];
                        xAxisCate.push(item.xAxis);
                    }
                    for (var i = 0; i < chartData.length; i++) {
                        innArray.push(chartData[i].value);
                    }
                    seriesArray.push({data: innArray, name: data.value[0].text});
                    // 图表数据顏色
                    var yData = seriesArray;
                    for (var i = 0; i < yData.length; i++) {
                        yData[i].color = '#01AEAD';
                    }
                };

                var chart;
                Highcharts.setOptions({
                    lang: {
                        resetZoom: '重置',
                        resetZoomTitle: '重置缩放比例'
                    }
                });

                /**
                 * 渲染图表
                */
                var drawChart = function (data) {
                    dealdata(data);
                    chart = new Highcharts.Chart({
                        chart: {
                            type: scope.chartType,
                            renderTo: 'callingChart_' + scope.index,
                            backgroundColor: '#FFF',
                            borderBottomRightRadius: '10px',
                            height: 302,
                            marginTop: 10,
                            color: '#fff'
                        },
                        title: {
                            text: ''
                        },
                        legend: {
                            show: false,
                            enabled: false,
                            itemStyle: {
                                fontFamily: 'Microsoft YaHei',
                                color: '#B2B2B2',
                                fontWeight: 'normal'
                            },
                            itemHoverStyle: {
                                color: '#B2B2B2'
                            }
                        },
                        subtitle: {
                            text: ''
                        },
                        exporting: {
                            enabled: false
                        },
                        credits: {
                            enabled: false
                        },
                        xAxis: {
                            tickLength: 0,
                            categories: xAxisCate,
                            labels: {
                                style: {
                                    color: '#B2B2B2',
                                    fontFamily: 'Microsoft YaHei',
                                    fontWeight: 'normal',
                                    textShadow: 'none',
                                    fontSize: '12px'
                                },
                                formatter: function () {
                                    if (scope.xSelectKey === 'brand' || scope.xSelectKey === 'voiceId') {
                                        var xData = this.value.length > 6 ? this.value.substring(0, 6) + '...' : this.value;
                                        return xData;
                                    }

                                    return this.value;
                                }
                            },
                            tickWidth: 0,
                            tickInterval: xAxisCate.length > 10 ? 5 : 1
                        },
                        yAxis: {
                            gridLineWidth: 0,
                            min: 0,
                            title: '',
                            lineWidth: 1,
                            labels: {
                                style: {
                                    color: '#B2B2B2',
                                    fontFamily: 'Microsoft YaHei'
                                }
                            }
                        },
                        tooltip: {
                            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                                '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
                            footerFormat: '</table>',
                            shared: true,
                            useHTML: true
                        },
                        plotOptions: {
                            column: {
                                borderWidth: '0', // 去边框
                                shadow: false, // 去阴影
                                stacking: 'normal',
                                dataLabels: {
                                    enabled: false,
                                    shadow: false
                                }
                            }
                        },
                        legend: {
                            backgroundColor: '#FFF'
                        },
                        series: seriesArray
                    });
                };

                scope.$on('changeTypeData', function (event, data) {
                    scope.chartType = data.chartType;
                    scope.getChartData();
                });

                /**
                 * 获取柱状图数据
                */
                scope.getChartData = function () {
                    var chartParams = {
                        xAxis: scope.xSelectKey,
                        mainAxis: scope.mainAxis,
                        order: scope.xSelectKey,
                        orderType: 'asc',
                        condition: [],
                        secondaryAxis: [],
                        pathID: scope.item.pathId
                    };
                    var params = {startTime: scope.$parent.$parent.time.start, endTime: scope.$parent.$parent.time.end, chartParams: JSON.stringify(chartParams)};

                    /*石勇 新增 增加默认传值*/
                    if (params.startTime.length < 11) {
                        params.startTime = params.startTime + ' 00:00:00';
                        params.endTime = params.endTime + ' 23:59:59';
                    }

                    // 
                    reportService.getLineColumData(params)
                        .then(function (result) {
                            if (result.value && result.value.length) {
                                scope.allShow = true;
                                $timeout(function () {
                                    drawChart(result);
                                }, 500);
                            }
                            else {
                                scope.allShow = false;
                            }
                        });
                };

                scope.toggle = function (axis) {
                    if (axis == 'x') {
                        scope.axisShow = !scope.axisShow;
                    }
                    else {
                        scope.yOptionShow = !scope.yOptionShow;
                    }
                };

                /**
                 * 点解窗口任意位置，关闭下拉列表
                */
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).hasClass('select-x') && scope.axisShow) {
                        scope.axisShow = false;
                    }

                    if (!angular.element(event.target).hasClass('select-y') && scope.yOptionShow) {
                        scope.yOptionShow = false;
                    }

                    scope.$apply();
                });

                /**
                         * [dropClick 点击下拉框]
                         * @param  {[type]} event [description]
                         * @param  {[type]} id    [description]
                         * @return {[type]}       [description]
                         */
                scope.dropClick = function (axis, item, index) {
                    // 请求数据传参x,y轴各自选项  如果当前选择的是X轴下拉列表，xid改变；否则yId改变
                    if (axis == 'x') {
                        // 取当前选择的x轴条件
                        scope.xSelected = $.trim(item.name);
                        scope.xSelectKey = item.key;
                        // 隐藏x下拉列表
                        scope.axisShow = false;
                    }
                    else {
                        // 取当前选择的x轴条件
                        scope.ySelected = $.trim(item.measureName);
                        scope.ySelectKey = item.measure;
                        var yAxis = {
                            text: scope.ySelected,
                            measure: scope.ySelectKey,
                            chartType: 'line',
                            type: 'measure',
                            expression: scope.ySelectKey,
                            showType: 'value'
                        };
                        scope.mainAxis = [];
                        scope.mainAxis.push(yAxis);
                        // 隐藏x下拉列表
                        scope.yOptionShow = false;
                    }
                    scope.getChartData();
                };

                /**
                 * [getAxisDrop 获取XY轴的数据]
                 * @return {[type]} [description]
                 */
                scope.getAxisDrop = function () {
                    reportService.getAllMeasure()
                        .then(function (result) {
                            scope.ySelectList = result.value || [];
                            // 如果已有选中保存的项，不需初始化赋值查询
                            if (scope.xSelectKey && scope.ySelectKey) {
                                angular.forEach(scope.ySelectList, function (item) {
                                    if (scope.ySelectKey === item.measure) {
                                        scope.ySelected = item.measureName;
                                        return;
                                    }

                                });
                            }
                            else {
                                scope.xSelected = scope.xSelect[0].name;
                                scope.xSelectKey = scope.xSelect[0].key;
                                scope.ySelected = scope.ySelectList[0].measureName;
                                scope.ySelectKey = scope.ySelectList[0].measure;
                            }
                            var yAxis = {
                                text: scope.ySelected,
                                measure: scope.ySelectKey,
                                chartType: 'line',
                                type: 'measure',
                                expression: scope.ySelectKey,
                                showType: 'value'
                            };
                            scope.mainAxis = [];
                            scope.mainAxis.push(yAxis);
                            // 请求图表数据
                            scope.getChartData();
                        });
                };

                scope.$watch('item', function (newValue, oldValue) {
                    if (!newValue) {
                        return;
                    }

                    scope.getParams();
                    scope.getAxisDrop();
                });
            } // 此处link结束
        };
    }]);

});
