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

    /**
     * @brief 业务概览通话趋势指令
     * @details [long description]
     *
     * @param  [description]
     * @return [description]
     */
    app.directive('busiCallChart', ['topicService', function (topicService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'analysis/busiOverview/callChart.htm',
            transclude: true,
            scope: {
                timesRange: '=timesRange'
            },
            link: function (scope, element, attrs) {

                scope.callTypeName = '全部';
                scope.flag = 0; // 默认为0,0表示全部，1其他
                scope.isOpen = false;
                scope.dimList = [];

                scope.type = 'day';
                scope.text = '日通话量趋势';
                scope.uid = Math.floor(Math.random() * 1000) + 1000;
                scope.params = {};
                scope.currentModel = -1;

                // 监听模型变更
                scope.$on('model-changed', function (e, d) {
                    scope.params.id = d.modelId;
                    scope.params.modelOrGroup = d.modelOrGroup;
                    scope.params.timeType = scope.type;
                    queryData();
                    scope.currentModel = d.modelId;
                });

                scope.$on('date-changed', function (e, d) {
                    scope.params = $.extend(scope.params, d);
                    // queryData();
                });

                var queryData = function () {
                    scope.params.timeType = scope.type;
                    var params = $.extend(scope.params, {
                        beginDate: scope.timesRange.defaultStart,
                        endDate: scope.timesRange.defaultEnd
                    });
                    topicService.getCallCountTrend(params)
                        .then(function (result) {
                            if (!result.value || !result.value.yData) {
                                return;
                            }

                            var yData = [{
                                color: '#01AEAD',
                                data: result.value.yData.data,
                                name: result.value.yData.name
                            }];
                            result.value.yData = yData;
                            drawChart(result.value, scope.text);
                            scope.dayChoosed = scope.type === 'day' ? true : false;
                            scope.hourChoosed = scope.type === 'day' ? false : true;
                        });
                };

                var chart;
                var drawChart = function (data, text) {
                    chart = new Highcharts.Chart({
                        chart: {
                            type: 'column',
                            renderTo: 'chart_busiOverview',
                            backgroundColor: '#fff',
                            borderRadius: '0',
                            color: '#fff'
                        },
                        legend: {
                            itemStyle: {
                                fontFamily: 'Microsoft YaHei',
                                color: '#B2B2B2',
                                fontWeight: 'normal'
                            },
                            itemHoverStyle: {
                                color: '#B2B2B2'
                            }
                        },
                        title: {
                            text: text,
                            style: {
                                fontFamily: 'Microsoft YaHei',
                                fontSize: '12px',
                                color: '#3E3E3E'
                            },
                            show: false
                        },
                        exporting: {
                            enabled: false
                        },
                        credits: {
                            enabled: false
                        },
                        xAxis: {
                            tickLength: 0,
                            categories: data.xData,
                            labels: {
                                style: {
                                    color: '#B2B2B2',
                                    fontFamily: 'Microsoft YaHei',
                                    fontSize: '12px'
                                }
                            }
                        },
                        yAxis: {
                            gridLineWidth: 0,
                            min: 0,
                            title: '',
                            lineWidth: 1,
                            labels: {
                                style: {
                                    color: '#B2B2B2',
                                    fontFamily: 'Microsoft YaHei',
                                    fontSize: '12px'
                                }
                            }
                        },

                        tooltip: {
                            style: {
                                fontFamily: 'Microsoft YaHei',
                                color: '#333333',
                                fontSize: '12px',
                                padding: '8px'
                            },
                            formatter: function () {
                                return '<b>' + this.x + '</b><br/>' +
                                    this.series.name + ': ' + this.y;
                            }
                        },
                        plotOptions: {
                            column: {
                                borderWidth: '0', // 去边框
                                shadow: false, // 去阴影
                                stacking: 'normal',
                                dataLabels: {
                                    enabled: true,
                                    shadow: false,
                                    style: {
                                        fontFamily: 'Microsoft YaHei',
                                        fontWeight: 'normal',
                                        textShadow: 'none',
                                        fontSize: '12px',
                                        color: '#333'
                                    }
                                }
                            },
                            spline: {
                                lineWidth: 1, // 粗细：lineWidth  默认值为2
                                fillOpacity: 0.1,
                                marker: {
                                    radius: 2
                                },
                                shadow: false
                            },
                            line: {
                                dataLabels: {
                                    enabled: true,
                                    shadow: false,
                                    style: {
                                        fontFamily: 'Microsoft YaHei',
                                        fontWeight: 'normal',
                                        textShadow: 'none',
                                        fontSize: '12px',
                                        color: '#333'
                                    }
                                }
                            }
                        },
                        series: data.yData
                    });
                };

                /**
                 * [openDataChart 通话时长]
                 * @return {[type]} [description]
                 */

                /*scope.openChart = function (param, text) {
                    topicService.busiOverview({
                        timeType: param,
                        flag: scope.flag,
                        dimIndexField: scope.dimIndexField,
                        dimValue: scope.callTypeName,
                        beginDate: scope.timesRange.defaultStart,
                        endDate: scope.timesRange.defaultEnd
                    }).then(function(result){
                        if (result.value) {
                            var yData = result.value.yData || [];
                            for (var i = 0; i < yData.length; i++) {
                                yData[i].color = '#01AEAD';
                            }

                            result.value.yData = yData;

                            drawChart(result, text);
                            scope.dayChoosed = scope.type === 'day' ? true : false;
                            scope.hourChoosed = scope.type === 'day' ? false : true;
                        }
                    });
                };*/
                // 是否展示下拉列表

                /*scope.showOpen = function () {
                    scope.isOpen = !scope.isOpen;
                }*/

                // 选择类型

                /*scope.selectType = function (item) {
                    if (angular.isUndefined(item)) {
                        scope.callTypeName = "全部";
                        scope.flag = 0;
                    } else {
                        scope.callTypeName = item;
                        scope.flag = 1;
                    }
                    scope.showOpen();
                    scope.openChart(scope.type, scope.text);
                }*/

                // 获取通话时长趋势条件维度接口

                /* scope.getCallTimeTrendDimList = function () {
                     topicService.busiOverview({
                         flag: 1,
                         beginDate: scope.timesRange.defaultStart,
                         endDate: scope.timesRange.defaultEnd
                     }).then(function(result){
                         scope.dimList = result.value.dimValue || [];
                         scope.dimIndexField = result.value.dimIndexField;
                         scope.openChart(scope.type, scope.text);
                     });
                 }*/
                // 设置类型
                scope.setOpenChart = function (type, text) {
                    scope.type = type;
                    scope.text = text;
                    queryData();
                };
            }
        };
    }]);
});
