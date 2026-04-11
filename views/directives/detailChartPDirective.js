/**
 * 实现报表详情页面的 控制器逻辑
 *
 */
(function (factory) {
    if (typeof define === 'function' && !!define.amd) {
        define([
            'app',
            'jquery-ui'
        ], factory);
    }
    else {
        factory(window.app);
    }
})(function (app) {
    app.directive('detailchartp', [
        '$q',
        'dialogService',
        'reportService', function ($q, dialogService, reportService) {

            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'directives/detailChartP-directive.htm',
                transclude: true,
                scope: {
                    tableDefault: '=', // 可修改参数与controller一致
                    viewConfig: '=', // 保留预览参数
                    opType: '=',
                    pageId: '=',
                    moduleName: '=',
                    moduleId: '='
                },
                link: function (scope, element, attrs) {
                    scope.isPreview = false;

                    scope.defaultDimensionIndex = -1; // 上一次类别在维度中的位置

                    scope.measureIndex = -1; // 上一次参数在指标/计算项中的位置

                    // 获取所有维度
                    scope.dimensions = scope.$parent.getDims();
                    angular.forEach(scope.dimensions, function (item, index) {
                        if (item.key == 'voiceId') {
                            i = index;
                        }

                    });
                    if (i > -1) {
                        scope.dimensions.splice(i, 1);
                    }

                    for (var i = 0; i < scope.dimensions.length; i++) {
                        var item = scope.dimensions[i];
                        if (item.key == 'timeDim') {
                            // 统计周期
                            scope.timeDimList = item.value;
                        }

                        if (item.key == scope.tableDefault.legend) {
                            scope.tableDefault.legendText = item.name;
                            item.hasAdd = true;
                            scope.defaultDimensionIndex = i;
                        }
                        else {
                            item.hasAdd = false;
                        }
                    }

                    // 所有指标
                    var measures = scope.$parent.getMeas();

                    // 设置添加标志
                    for (var i = 0; i < measures.length; i++) {
                        var item = measures[i];
                        if (item.measure == scope.tableDefault.measure) {
                            scope.tableDefault.text = item.measureName;
                            item.hasAdd = true;
                            scope.measureIndex = i;
                        }
                        else {
                            item.hasAdd = false;
                        }
                    }
                    scope.measures = measures;

                    // 设置计算项
                    scope.computers = [];
                    if (scope.tableDefault.measureOrcomputer == 'computer') {
                        if (!scope.tableDefault.text) {
                            scope.tableDefault.text = scope.viewConfig.text || '';
                        }

                        if (!scope.tableDefault.measure) {
                            scope.tableDefault.measure = scope.viewConfig.measure || '';
                        }

                        if (!scope.tableDefault.expression) {
                            scope.tableDefault.expression = scope.viewConfig.expression || '';
                        }

                        scope.computers.push({
                            text: scope.tableDefault.text,
                            measure: scope.tableDefault.measure,
                            expression: scope.tableDefault.expression,
                            hasAdd: true
                        });
                        scope.measureIndex = 0;
                    }

                    var dealdata = function (data) {
                        var dataList = [];
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
                                renderTo: 'cl_chart',
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
                                        format: '{point.name}'
                                    }
                                }
                            },
                            series: [{
                                type: 'pie',
                                name: scope.viewConfig.text,
                                data: dataList
                            }]
                        });
                        scope.viewConfig.svg = scope.tableDefault.svg = chart.getSVG();
                    };

                    if (!scope.tableDefault.timeDimText) {
                        scope.tableDefault.timeDimText = scope.timeDimList[2].value;
                        scope.tableDefault.timeDimKey = scope.timeDimList[2].key;
                    }

                    var pietableData;
                    if (scope.viewConfig.legend && scope.viewConfig.measure) {
                        scope.viewConfig.type = scope.tableDefault.measureOrcomputer || 'measure';
                        scope.viewConfig.condition = scope.$parent.condition;
                        if (scope.viewConfig.legend == 'timeDim') {
                            scope.viewConfig.legend = scope.viewConfig.timeDimKey;
                        }

                        scope.viewConfig.condition = scope.$parent.condition;

                        /*石勇 新增 增加默认传值*/
                        var newStartTime = scope.$parent.timesRange.defaultStart;
                        var newEndTime = scope.$parent.timesRange.defaultEnd;
                        if (newStartTime.length < 11) {
                            newStartTime = newStartTime + ' 00:00:00';
                            newEndTime = newEndTime + ' 23:59:59';
                        }

                        // 
                        reportService.getPieData({
                            timeType: scope.$parent.timesRange.timeType,
                            timeValue: scope.$parent.timesRange.timeValue,
                            startTime: newStartTime,
                            endTime: scope.$parent.timesRange.isToNow ? 'uptonow' : newEndTime,
                            chartParams: JSON.stringify(scope.viewConfig)
                        }).then(function (result) {
                            pietableData = result.value.data;
                            drawChart(result.value.data);
                        });
                    }

                    // 预览
                    scope.setView = function () {
                        if (!scope.tableDefault.legend || !scope.tableDefault.measure) {
                            dialogService.alert('列表项为空');
                            return $q.reject(false);
                        }

                        scope.viewConfig.legend = scope.tableDefault.legend;
                        scope.viewConfig.timeDimKey = scope.tableDefault.timeDimKey;
                        scope.viewConfig.timeDimText = scope.tableDefault.timeDimText;
                        if (scope.viewConfig.legend == 'timeDim') {
                            scope.viewConfig.legend = scope.viewConfig.timeDimKey;
                        }

                        scope.viewConfig.measure = scope.tableDefault.measure;
                        scope.viewConfig.text = scope.tableDefault.text;
                        scope.viewConfig.expression = scope.tableDefault.expression;
                        scope.viewConfig.type = scope.tableDefault.measureOrcomputer || 'measure';
                        scope.viewConfig.condition = scope.$parent.condition;

                        /*石勇 新增 增加默认传值*/
                        var newStartTime = scope.$parent.timesRange.defaultStart;
                        var newEndTime = scope.$parent.timesRange.defaultEnd;
                        if (newStartTime.length < 11) {
                            newStartTime = newStartTime + ' 00:00:00';
                            newEndTime = newEndTime + ' 23:59:59';
                        }

                        // 
                        reportService.getPieData({
                            timeType: scope.$parent.timesRange.timeType,
                            timeValue: scope.$parent.timesRange.timeValue,
                            startTime: newStartTime,
                            endTime: scope.$parent.timesRange.isToNow ? 'uptonow' : newEndTime,
                            chartParams: JSON.stringify(scope.viewConfig)
                        }).then(function (result) {
                            scope.isPreview = true;
                            pietableData = result.value.data;
                            drawChart(result.value.data);
                        });
                    };

                }
            };

        }]);

});
