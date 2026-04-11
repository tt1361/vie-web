/**
 * 本文件中的directive 实现模型通话列表页面的图形的组件
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
    app.directive('callShow', ['gdModelService', function (gdModelService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'model/voice/call-show-directive.htm',
            transclude: true,
            scope: {
                modelId: '='
            },
            link: function ($scope, element, attrs) {
                $scope.showTab = 1; // 0表示表格，1柱状图，2折线图，默认为1
                $scope.isDetail = 0; // 默认显示跨步，0显示，1不显示
                // 切换显示格式
                $scope.changeTab = function (type) {
                    $scope.showTab = type;
                    if (type === 1) { // 柱状图
                        $scope.isDetail = 0;
                    }
                    else if (type === 2) { // 折线图
                        $scope.isDetail = 0;
                    }
                    else {
                        $scope.isDetail = 1;
                    }
                    $scope.getColumData();
                };

                // 表格分页
                $scope.pageTableOptions = {
                    pageNum: 1,
                    pageSize: 10
                };

                // 处理结果数据为表格图表展示格式
                var dealdata = function (data) {
                    innArray = data.yData;
                    seriesArray = [];
                    seriesArray.push({data: innArray, name: '通话量'});
                    // 图表数据顏色
                    var yData = seriesArray;
                    for (var i = 0; i < yData.length; i++) {
                        yData[i].color = '#01AEAD';
                    }
                };

                var chart;
                var drawChart = function (data, type) {
                    dealdata(data);
                    chart = new Highcharts.Chart({
                        chart: {
                            type: type,
                            renderTo: 'call-list-chart',
                            backgroundColor: '#fff',
                            borderBottomRightRadius: '10px',
                            color: '#fff'
                        },
                        title: {
                            text: ''
                        },
                        legend: {
                            align: 'center',
                            verticalAlign: 'top',
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
                            categories: data.xData,
                            labels: {
                                style: {
                                    color: '#B2B2B2',
                                    fontFamily: 'Microsoft YaHei',
                                    fontWeight: 'normal',
                                    textShadow: 'none',
                                    fontSize: '12px'
                                }
                            },
                            tickWidth: 0
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
                        series: seriesArray
                    });
                };

                // 获取结果
                $scope.getColumData = function () {
                    var params = {};
                    params = $.extend(params, $scope.pageTableOptions);
                    params = $.extend(params, {modelId: $scope.modelId, startTime: $scope.time.defaultStart, endTime: $scope.time.defaultEnd, isDetail: $scope.isDetail});

                    /*石勇 新增 增加默认传值*/
                    if (params.startTime.length < 11) {
                        params.startTime = params.startTime + ' 00:00:00';
                        params.endTime = params.endTime + ' 23:59:59';
                    }

                    // 
                    gdModelService.getColumData(params)
                        .then(function (result) {
                            $scope.data = result.value || [];
                            if ($scope.showTab === 1) { // 柱状图
                                drawChart($scope.data, 'column');
                            }
                            else if ($scope.showTab === 2) { // 折线图
                                drawChart($scope.data, 'line');
                            }
                            else { // 表格
                                $scope.countsTable = result.value ? result.value.pageInfo.totalRows : 0;
                            }
                        });
                };

                $scope.$on('queryColumData', function (event, data) {
                    $scope.pageTableOptions.pageNum = 1;
                    $scope.time = data.time;
                    $scope.getColumData();
                });
            }
        };
    }]);

});
