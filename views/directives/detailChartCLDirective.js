/**
 * 本文件中的directives  详情页柱折图的功能
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

    app.directive('detailchartcl', [
        '$q',
        'dialogService',
        'reportService', function ($q, dialogService, reportService) {

            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'directives/detailChartCL-directive.htm',
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
                    // 为发送到概览做是否预览判断
                    scope.isPreview = false;
                    // 操作类型  add:添加   update:更新
                    scope.opType = scope.$parent.opType;
                    // 默认维度
                    scope.defaultDimensionIndex = -1; // 上一次X轴在维度中的位置

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

                    // 默认排序
                    scope.order = 'xAxis';
                    scope.orderText = 'X轴';

                    // 设置维度添加标志
                    scope.resetDimension = function () {
                        var key = scope.tableDefault.xAxis;
                        for (var i = 0; i < scope.dimensions.length; i++) {
                            var dimension = scope.dimensions[i];
                            if (dimension.key == 'timeDim') {
                                // 统计周期
                                scope.timeDimList = dimension.value;
                            }

                            if (key && dimension.key == key) {
                                dimension.hasAdd = true;
                                scope.defaultDimensionIndex = i;
                                scope.tableDefault.xAxisText = dimension.name;
                            }
                            else {
                                dimension.hasAdd = false;
                            }
                        }
                    };

                    scope.resetDimension();

                    // 所有指标
                    var measures = scope.$parent.getMeas();

                    // 设置指标添加标志
                    function resetAddM(measures, type) {
                        for (var i = 0; i < measures.length; i++) {
                            var measure = measures[i];
                            if (type == 'main') {
                                var index = scope.$parent.myInArray(scope.tableDefault.mainAxis, 'measure', measure.measure);
                                if (index > -1) {
                                    measure.hasAdd = '1';
                                    measure.chartType = scope.tableDefault.mainAxis[index].chartType;
                                    if (scope.tableDefault.order == measure.measure) {
                                        scope.order = 'mainAxis';
                                        scope.orderText = '主Y轴';
                                        scope.orderMname = measure.measureName;
                                    }
                                }
                                else {
                                    measure.hasAdd = measure.hasAdd || '0';
                                    measure.chartType = measure.chartType || 'column';
                                }
                            }
                            else {
                                index = scope.$parent.myInArray(scope.tableDefault.secondaryAxis, 'measure', measure.measure);
                                if (index > -1) {
                                    measure.hasAdd = '2';
                                    measure.chartType = scope.tableDefault.secondaryAxis[index].chartType;
                                    if (scope.tableDefault.order == measure.measure) {
                                        scope.order = 'secondaryAxis';
                                        scope.orderText = '副Y轴';
                                        scope.orderMname = measure.measureName;
                                    }
                                }
                                else {
                                    measure.hasAdd = measure.hasAdd || '0';
                                    measure.chartType = measure.chartType || 'column';
                                }
                            }

                        }
                        return measures;
                    }

                    measures = resetAddM(measures, 'main');
                    scope.measures = resetAddM(measures, 'secondary');

                    // 排序
                    scope.orderAxisList = [
                        {
                            id: 'xAxis',
                            text: 'X轴'
                        },
                        {
                            id: 'mainAxis',
                            text: '主Y轴'
                        },
                        {
                            id: 'secondaryAxis',
                            text: '副Y轴'
                        }
                    ];

                    scope.orderTypeList = [
                        {
                            id: 'desc',
                            text: '从大到小'
                        },
                        {
                            id: 'asc',
                            text: '从小到大'
                        }
                    ];

                    if (scope.tableDefault.orderType == 'desc') {
                        scope.orderTypeText = '从大到小';
                    }
                    else {
                        scope.orderTypeText = '从小到大';
                    }

                    // 监控排序
                    if (scope.order == 'mainAxis') {
                        scope.orderList = scope.tableDefault.mainAxis;
                    }
                    else if (scope.order == 'secondaryAxis') {
                        scope.secondOrderList = scope.tableDefault.secondaryAxis;
                    }
                    else {
                        scope.order = 'xAxis';
                    }

                    scope.$watch('order', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            if (newVal == 'mainAxis') {
                                scope.orderList = scope.tableDefault.mainAxis;
                                if (scope.tableDefault.mainAxis.length) {
                                    scope.tableDefault.order = scope.tableDefault.mainAxis[0].measure;
                                    scope.orderMname = scope.tableDefault.mainAxis[0].text;
                                }
                                else {
                                    scope.orderMname = '';
                                }
                            }
                            else if (newVal == 'secondaryAxis') {
                                scope.secondOrderList = scope.tableDefault.secondaryAxis;
                                if (scope.tableDefault.secondaryAxis.length) {
                                    scope.tableDefault.order = scope.tableDefault.secondaryAxis[0].measure;
                                    scope.orderMname = scope.tableDefault.secondaryAxis[0].text;
                                }
                                else {
                                    scope.orderMname = '';
                                }
                            }
                            else {
                                scope.tableDefault.order = scope.viewConfig.order = scope.tableDefault.xAxis;
                            }
                            scope.viewConfig.svg = '';
                            scope.tableDefault.hasChanged = true;
                        }

                    }, true);

                    scope.$watch('tableDefault.order', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            scope.viewConfig.svg = '';
                            scope.tableDefault.hasChanged = true;
                        }

                    }, true);

                    scope.$watch('tableDefault.orderType', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            scope.viewConfig.svg = '';
                            scope.tableDefault.hasChanged = true;
                        }

                    }, true);

                    scope.computers = [];

                    // 设置默认计算项
                    for (var i = 0; i < scope.tableDefault.mainAxis.length; i++) {
                        var item = scope.tableDefault.mainAxis[i];
                        if (item.type == 'computer') {
                            item.hasAdd = '1';
                            scope.computers.push(angular.copy(item));
                        }

                    }
                    for (var i = 0; i < scope.tableDefault.secondaryAxis.length; i++) {
                        var item = scope.tableDefault.secondaryAxis[i];
                        if (item.type == 'computer') {
                            item.hasAdd = '2';
                            scope.computers.push(angular.copy(item));
                        }

                    }

                    var xAxisCate;

                    var seriesArray;

                    // 处理结果数据为表格图表展示格式

                    var dealdata = function (data) {
                        xAxisCate = [];
                        seriesArray = [];
                        for (var i = 0; i < scope.viewConfig.mainAxis.length; i++) {
                            var axis = scope.viewConfig.mainAxis[i];
                            var item = {};
                            item.name = axis.text;
                            item.filed = axis.measure;
                            item.type = axis.chartType;
                            item.yAxis = 0;
                            item.data = [];
                            seriesArray.push(item);
                        }

                        for (var i = 0; i < scope.viewConfig.secondaryAxis.length; i++) {
                            var axis = scope.viewConfig.secondaryAxis[i];
                            var item = {};
                            item.name = axis.text;
                            item.filed = axis.measure;
                            item.type = axis.chartType;
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
                            var reg = /%+/;
                            if (reg.test(item.value)) {
                                var valueTemp = item.value.replace(/%/, '');
                                item.value = valueTemp / 100;
                            }

                            seriesArray[index].data.push(item.value);
                        }
                    };

                    var chart;

                    Highcharts.setOptions({
                        lang: {
                            resetZoom: '重置',
                            resetZoomTitle: '重置缩放比例'
                        }
                    });
                    // 判断是否是ie8-
                    function checkIE_8() {
                        var browser = navigator.appName;
                        var b_version = navigator.appVersion;
                        var version = b_version.split(';');
                        var trim_Version = version[1].replace(/[ ]/g, '').replace(/MSIE/g, '');
                        if (browser == 'Microsoft Internet Explorer' && parseInt(trim_Version, 10) <= 8.0) {
                            return true;
                        }

                        return false;
                    }
                    var drawChart = function (data) {
                        dealdata(data);
                        chart = new Highcharts.Chart({
                            chart: {
                                renderTo: 'cl_chart',
                                zoomType: 'xy',
                                backgroundColor: '#fff',
                                color: '#838d96'
                            },
                            exporting: {
                                enabled: false
                            },
                            title: {
                                text: ''
                            },
                            credits: {
                                enabled: false
                            },
                            loading: false,
                            plotOptions: {
                                column: {
                                    borderColor: '', // 去边框
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
                                        if (scope.viewConfig.xAxis === 'brand' || scope.viewConfig.xAxis === 'voiceId' || scope.viewConfig.xAxis === 'taskId') {
                                            var xData = this.value.length > 15 ? this.value.substring(0, 15) + '...' : this.value;
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
                            }, { // Secondary yAxis
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

                                    /*format: '{value} mm',*/
                                    style: {
                                        color: '#20a8ff'
                                    }
                                },
                                opposite: true
                            }],
                            tooltip: {

                                /*shared: true,
                                style: {
                                    padding: 10,
                                    fontWeight: 'bold'
                                }*/
                                headerFormat: '<span style="font-size:10px;width:200px;">{point.key}</span><br/>',
                                shared: true,
                                useHTML: true
                            },
                            legend: {
                                backgroundColor: '#FFFFFF'
                            },
                            series: seriesArray
                        });

                        scope.viewConfig.svg = scope.tableDefault.svg = chart.getSVG();
                        scope.isPreview = true;
                    };

                    var cltableData;
                    if (!scope.tableDefault.timeDimText) {
                        scope.tableDefault.timeDimText = scope.timeDimList[2].value;
                        scope.tableDefault.timeDimKey = scope.timeDimList[2].key;
                    }

                    if (scope.viewConfig.xAxis && (scope.viewConfig.secondaryAxis.length > 0 || scope.viewConfig.mainAxis.length > 0)) {
                        if (scope.viewConfig.xAxis == 'timeDim') {
                            scope.viewConfig.xAxis = scope.viewConfig.timeDimKey;
                        }

                        if (scope.order == 'xAxis') {
                            scope.viewConfig.order = scope.viewConfig.xAxis;
                        }

                        scope.viewConfig.condition = scope.$parent.condition;
                        var param = {
                            timeType: scope.$parent.timesRange.timeType,
                            timeValue: scope.$parent.timesRange.timeValue,
                            startTime: scope.$parent.timesRange.defaultStart,
                            endTime: scope.$parent.timesRange.defaultEnd,
                            chartParams: JSON.stringify(scope.viewConfig)
                        };
                        if (scope.$parent.timesRange.isToNow) {
                            param.endTime = 'uptonow';
                        }

                        /*石勇 新增 增加默认传值*/
                        if (param.startTime.length < 11) {
                            param.startTime = param.startTime + ' 00:00:00';
                            param.endTime = param.endTime + ' 23:59:59';
                        }

                        // 
                        reportService.getLineColumData(param)
                            .then(function (result) {
                                cltableData = result.value;
                                if (!result.value) {
                                    return;
                                }

                                drawChart(result.value);
                            });
                    }

                    scope.$watch('tableDefault.title', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            scope.viewConfig.title = scope.tableDefault.title;
                        }

                    });

                    // 预览
                    scope.setShow = function () {
                        if (!scope.tableDefault.xAxis || (scope.tableDefault.secondaryAxis.length == 0 && scope.tableDefault.mainAxis.length == 0)) {
                            dialogService.alert('列表项为空');
                            return $q.reject(false);
                        }
                        if (!scope.$parent.tableData.endTime) {
                            dialogService.alert('结束时间与至今必须二选一');
                            return $q.reject(false);
                        }
                        scope.viewConfig.title = scope.tableDefault.title;
                        scope.viewConfig.orderType = scope.tableDefault.orderType;
                        scope.viewConfig.condition = scope.$parent.condition;
                        scope.viewConfig.xAxis = scope.tableDefault.xAxis;
                        scope.viewConfig.timeDimKey = scope.tableDefault.timeDimKey;
                        scope.viewConfig.timeDimText = scope.tableDefault.timeDimText;
                        if (scope.viewConfig.xAxis == 'timeDim') {
                            scope.viewConfig.xAxis = scope.viewConfig.timeDimKey;
                        }

                        if (scope.order == 'xAxis') {
                            scope.viewConfig.order = scope.viewConfig.xAxis;
                        }
                        else {
                            scope.viewConfig.order = scope.tableDefault.order;
                        }
                        scope.viewConfig.secondaryAxis = angular.copy(scope.tableDefault.secondaryAxis);
                        scope.viewConfig.mainAxis = angular.copy(scope.tableDefault.mainAxis);
                        // 利用tableDefault绘制表格
                        var param = {
                            timeType: scope.$parent.timesRange.timeType,
                            timeValue: scope.$parent.timesRange.timeValue,
                            startTime: scope.$parent.timesRange.defaultStart,
                            endTime: scope.$parent.timesRange.defaultEnd,
                            chartParams: JSON.stringify(scope.viewConfig)
                        };
                        if (scope.$parent.timesRange.isToNow) {
                            param.endTime = 'uptonow';
                        }

                        /*石勇 新增 增加默认传值*/
                        if (param.startTime.length < 11) {
                            param.startTime = param.startTime + ' 00:00:00';
                            param.endTime = param.endTime + ' 23:59:59';
                        }

                        // 
                        reportService.getLineColumData(param)
                            .then(function (result) {
                                // scope.isPreview = true;
                                cltableData = result.value;
                                if (!result.value) {
                                    return;
                                }

                                drawChart(result.value);
                            });
                    };

                }
            };

        }]);

});
