/**
 * 系统首页通话时长趋势
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
    app.directive('chartcall', ['$timeout', 'systemIndexService', function ($timeout, systemIndexService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/system/call-duration.htm',
            link: function (scope, element, attrs) {
                scope.callTypeName = '全部';
                scope.chartTypeName = '汇总';
                scope.timeTypeName = '日';
                scope.durationType = -1; // 0 静音时长; 1 有效时长 ; 2 通话时长 ; -1 非对比
                scope.hideDurationType = true; // 隐藏时长选择下拉列表
                scope.centerDimsion = 0; // 0 全部(汇总); 1 指定中心; 2 对比
                scope.flag = 0; // 默认为0,0表示全部，1其他
                scope.isOpen = false;
                scope.isCallOpen = false;
                scope.isOpenChart = false; // 汇总/对比下拉列表展示标志
                scope.isOpenTime = false; // 日/时下拉列表展示标志
                scope.isOpenDuration = false; // 通话时长下拉列表展示标志
                scope.dimList = [];
                scope.timeType = 'day';

                var chart;
                var drawChart = function (data) {
                    chart = new Highcharts.Chart({
                        chart: {
                            type: 'column',
                            renderTo: 'chart',
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
                            },
                            align: scope.chartTypeName === '汇总' ? 'center' : 'right',
                            verticalAlign: scope.chartTypeName === '汇总' ? 'bottom' : 'middle',
                            layout: scope.chartTypeName === '汇总' ? 'horizontal' : 'vertical'
                        },
                        title: {
                            text: scope.chartTypeName === '汇总' ? (scope.timeTypeName === '日' ? '日均通话时长趋势图（近一周）' : '日均通话时长趋势图（昨日）') : '',
                            style: {
                                fontFamily: 'Microsoft YaHei',
                                fontSize: '12px',
                                color: '#3E3E3E'
                            }
                        },
                        exporting: {
                            enabled: false
                        },
                        credits: {
                            enabled: false
                        },
                        xAxis: {
                            tickLength: 0,
                            categories: data.value.callTrendDimMap.xData,
                            labels: {
                                style: {
                                    color: '#B2B2B2',
                                    fontFamily: 'Microsoft YaHei'
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
                                    fontFamily: 'Microsoft YaHei'
                                }
                            },
                            plotLines: [{
                                color: scope.chartTypeName === '汇总' ? null : '#808080',
                                width: scope.chartTypeName === '汇总' ? null : 1,
                                value: scope.chartTypeName === '汇总' ? null : 0
                            }]
                        },
                        tooltip: {
                            style: {
                                fontFamily: 'Microsoft YaHei',
                                color: '#333333',
                                fontSize: '12px',
                                padding: '8px'
                            },
                            formatter: function () {
                                var showName = scope.chartTypeName === '汇总' ? this.series.name : scope.durationTypeName;
                                return '<b>' + this.x + '</b><br/>' +
                                    showName + ': ' + this.y;
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
                        series: data.value.yData
                    });
                };

                /**
                 * [openDataChart 通话时长]
                 * @return {[timeType]} [description]
                 */
                scope.openChart = function () {
                    // 呼入呼出传入值使用0或1  
                    var callTypeTime = '全部';
                    if (scope.callTypeName === '呼入') {
                        callTypeTime = '0';
                    }
                    else if (scope.callTypeName === '呼出') {
                        callTypeTime = '1';
                    }

                    var params = {
                        timeType: scope.timeType,
                        flag: scope.flag,
                        dimIndexField: scope.dimIndexField,
                        dimValue: callTypeTime,
                        selectTime: scope.selectTime,
                        centerDimsion: scope.centerDimsion,
                        selectCenter: scope.selectCenter,
                        durationType: scope.durationType
                    };

                    /*石勇 新增 增加默认传值*/
                    if (params.selectTime.length < 11) {
                        params.selectTime = params.selectTime + ' 23:59:59';
                    }

                    // 
                    systemIndexService.getCallTimeTrendByDim(params)
                        .then(function (result) {
                            var yData = result.value ? result.value.callTrendDimMap.yData || [] : [];
                            scope.isEmpty = result.value && result.value.callTrendDimMap.yData ? false : true;
                            if (scope.centerDimsion != 2) {
                                for (var i = 0; i < yData.length; i++) {
                                    if (yData[i].name == '通话时长') {
                                        yData[i].color = '#8E8E8E';
                                        yData[i].type = 'line';
                                    }

                                    if (yData[i].name == '有效时长') {
                                        yData[i].color = '#01AEAD';
                                        yData[i].type = '';
                                    }

                                    if (yData[i].name == '静音时长') {
                                        yData[i].color = '#FF9D01';
                                        yData[i].type = '';
                                    }

                                }
                            }
                            else {
                                for (var i = 0; i < yData.length; i++) {
                                    var name = yData[i].name;
                                    yData[i].name = yData[i].center;
                                    yData[i].type = 'line';
                                    yData[i].center = name;
                                }
                            }
                            result.value.yData = yData;
                            if (scope.isEmpty) {
                                angular.element('#chart').empty();
                            }
                            else {
                                $timeout(function () {
                                    drawChart(result);
                                }, 500);
                            }
                        });
                };

                // 是否展示下拉列表
                scope.showCallOpen = function () {
                    scope.isCallOpen = !scope.isCallOpen;
                    scope.isOpenChart = false;
                    scope.isOpenTime = false;
                    scope.isOpenDuration = false;
                };

                // 是否展示汇总/对比下拉列表
                scope.showChartOpen = function () {
                    scope.isOpenChart = !scope.isOpenChart;
                    scope.isCallOpen = false;
                    scope.isOpenTime = false;
                    scope.isOpenDuration = false;
                };

                // 是否展示日/时下拉列表
                scope.showTimeOpen = function () {
                    scope.isOpenTime = !scope.isOpenTime;
                    scope.isOpenChart = false;
                    scope.isCallOpen = false;
                    scope.isOpenDuration = false;
                };

                // 是否展示日/时下拉列表
                scope.showDurationOpen = function () {
                    scope.isOpenDuration = !scope.isOpenDuration;
                    scope.isCallOpen = false;
                    scope.isOpenTime = false;
                    scope.isOpenChart = false;
                };

                // 选择类型
                scope.selectCallType = function (item) {
                    if (angular.isUndefined(item)) {
                        scope.callTypeName = '全部';
                        scope.flag = 0;
                    }
                    else {
                        scope.callTypeName = item;
                        scope.flag = 1;
                    }
                    scope.showCallOpen();
                    scope.openChart();
                };

                // 选择周期类型
                scope.selectTimeType = function (timeType, timeTypeName) {
                    if (angular.isUndefined(timeType)) {
                        scope.timeTypeName = '日';
                        scope.timeType = 'day';
                    }
                    else {
                        scope.timeTypeName = timeTypeName;
                        scope.timeType = timeType;
                    }
                    scope.showTimeOpen();
                    scope.openChart();
                };

                // 选择图表类型   汇总/对比
                scope.selectChartType = function (centerDimension, chartTypeName) {
                    if (angular.isUndefined(centerDimension)) {
                        scope.centerDimsion = scope.$parent.centerFlag;
                        scope.selectCenter = scope.$parent.selectCenter;
                        scope.chartTypeName = '汇总';
                        scope.hideDurationType = true;
                    }
                    else {
                        scope.centerDimsion = centerDimension;
                        scope.chartTypeName = chartTypeName;

                        if (scope.centerDimsion == 2) {
                            scope.hideDurationType = false;
                            scope.durationType = 2;
                            scope.durationTypeName = '通话时长';
                        }
                        else {
                            scope.hideDurationType = true;
                        }
                    }
                    scope.showChartOpen();
                    scope.openChart();
                };

                // 选择图表类型   汇总/对比
                scope.selectDurationType = function (durationType, durationTypeName) {
                    if (angular.isUndefined(durationType)) {
                        scope.durationType = -1;
                        scope.hideDurationType = true;
                    }
                    else {
                        scope.durationType = durationType;
                        scope.durationTypeName = durationTypeName;
                        scope.hideDurationType = false;
                    }
                    scope.showDurationOpen();
                    scope.openChart();
                };

                // 获取通话时长趋势条件维度接口
                scope.getCallTimeTrendDimList = function () {
                    systemIndexService.getCallTimeTrendDimList({
                        flag: 1
                    })
                        .then(function (result) {
                            scope.dimList = result.value ? result.value.dimValue || [] : [];
                            scope.dimIndexField = result.value ? result.value.dimIndexField : '';
                            scope.openChart(scope.timeType, scope.timeTypeName);
                        });
                };

                // 监听
                scope.$on('callDuration', function (event, data) {
                    scope.centerFlag = data.centerFlag;
                    scope.selectTime = data.selectTime;
                    scope.selectCenter = data.selectCenter;
                    scope.singleCenter = data.singleCenter;
                    // 如果选中心，则隐藏对比/汇总下拉列表
                    if (data.centerFlag === 1) {
                        scope.hideDurationType = true;
                        scope.durationType = -1;
                        scope.centerDimsion = 1;
                    }
                    else {
                        scope.hideDurationType = true;
                        scope.centerDimsion = 0;
                        scope.chartTypeName = '汇总';
                    }
                    scope.getCallTimeTrendDimList();
                });

                // 点击页面其他地方关闭弹窗
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.duration-type-div').length
                        && !angular.element(event.target).hasClass('picture-select-down')
                        && scope.isOpenDuration) {
                        scope.isOpenDuration = false;
                    }

                    if (!angular.element(event.target).parents('.call-type-div').length
                        && !angular.element(event.target).hasClass('picture-select-down')
                        && scope.isOpen) {
                        scope.isOpen = false;
                    }

                    if (!angular.element(event.target).parents('.call-type-div').length
                        && !angular.element(event.target).hasClass('picture-select-down')
                        && scope.isCallOpen) {
                        scope.isCallOpen = false;
                    }

                    if (!angular.element(event.target).parents('.time-type-div').length
                        && !angular.element(event.target).hasClass('picture-select-down')
                        && scope.isOpenTime) {
                        scope.isOpenTime = false;
                    }

                    if (!angular.element(event.target).parents('.chart-type-div').length
                        && !angular.element(event.target).hasClass('picture-select-down')
                        && scope.isOpenChart) {
                        scope.isOpenChart = false;
                    }

                    scope.$apply();
                });
            }

        };
    }]);
});
