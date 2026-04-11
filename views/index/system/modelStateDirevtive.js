/**
 * 系统首页快速模型概览
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
    app.directive('chartmodel', ['systemIndexService', 'modelService', function (systemIndexService, modelService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/system/model-state.htm',
            link: function (scope, element, attrs) {
                scope.isModelItemSelected = 0;
                scope.modelId = 0;
                var chart;

                var drawChart = function (data, titleName) {
                    chart = new Highcharts.Chart({
                        chart: {
                            type: 'column',
                            renderTo: 'modelChart',
                            backgroundColor: '#fff',
                            borderBottomRightRadius: '10px',
                            color: '#fff'
                        },
                        title: {
                            text: titleName,
                            style: {
                                fontFamily: 'Microsoft YaHei',
                                fontSize: '12px',
                                color: '#3E3E3E'
                            }
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
                            categories: data.value.xData,
                            labels: {
                                style: {
                                    color: '#B2B2B2',
                                    fontFamily: 'Microsoft YaHei'
                                }
                            },
                            tickInterval: data.value.xData.length > 12 ? 12 : 1
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
                            series: {
                                cursor: 'pointer',
                                point: {
                                    events: {
                                        click: function (event) {
                                            scope.callDay = formatDate(this.category);
                                            window.location.href = '#/model/' + scope.modelId + '/' + scope.callDay + '/index/' + scope.selectCenter + '/' + scope.centerFlag + '/voice';
                                        }
                                    }
                                }
                            }
                        },
                        series: data.value.yData
                    });
                };

                // 格式化时间
                function formatDate(data) {
                    var year = data.split('年')[0],
                        month = data.split('年')[1].split('月')[0],
                        day = data.split('月')[1].split('日')[0],
                        month = month < 10 ? '0' + month : month;
                    day = day < 10 ? '0' + day : day;
                    return year + '-' + month + '-' + day;
                }

                /**
                 * [toogel 下拉框的显示隐藏]
                 * @return {[type]} [description]
                 */
                scope.toogel = function () {
                    scope.optionShowModel = !scope.optionShowModel;
                };

                /**
                 * [getChartData 获取图表数据]
                 * @return {[type]} [description]
                 */
                scope.getChartData = function (id, title) {
                    var params = {
                        modelId: id,
                        // selectTime : scope.selectTime,
                        startTime: scope.startTime,
                        endTime: scope.endTime,
                        selectCenter: scope.selectCenter,
                        centerFlag: scope.centerFlag
                    };

                    /*石勇 新增 增加默认传值*/
                    if (params.startTime.length < 11) {
                        params.startTime = params.startTime + ' 00:00:00';
                        params.endTime = params.endTime + ' 23:59:59';
                    }

                    // 
                    systemIndexService.getModelAccuracy(params)
                        .then(function (result) {
                            if (result.value) {
                                var yData = result.value.yData || [];
                                for (var i = 0; i < yData.length; i++) {
                                    if (yData[i].name == '检出数') {
                                        yData[i].color = '#01AEAD';
                                        yData[i].name = '检出数';
                                    }

                                }
                                result.value.yData = yData;
                                drawChart(result, title);
                            }
                            else {
                                angular.element('.model-chart').empty();
                            }
                        });
                };

                /**
                 * [modelClick 点击模型]
                 * @param  {[type]} event [description]
                 * @param  {[type]} id    [description]
                 * @return {[type]}       [description]
                 */
                scope.modelClick = function (id, index, title) {
                    scope.getChartData(id, title);
                    scope.isModelItemSelected = index;
                    scope.modelId = id;
                };

                /**
                 * [getModulData 获取模型组的模型数据]
                 * @return {[type]} [description]
                 */
                scope.getModulData = function () {
                    var params = {
                        modelGroupId: scope.groupId,
                        // selectTime : scope.selectTime,
                        startTime: scope.startTime,
                        endTime: scope.endTime,
                        selectCenter: scope.selectCenter,
                        centerFlag: scope.centerFlag
                    };

                    /*石勇 新增 增加默认传值*/
                    if (params.startTime.length < 11) {
                        params.startTime = params.startTime + ' 00:00:00';
                        params.endTime = params.endTime + ' 23:59:59';
                    }

                    // 
                    systemIndexService.getModelByModelGroupId(params)
                        .then(function (result) {
                            scope.models = result && result.value ? result.value || [] : [];
                            if (result && result.value && result.value.length) {
                                var modelId = result.value[0].modelId;
                                scope.modelId = modelId;
                                var modelName = result.value[0].modelName;
                                scope.getChartData(modelId, modelName);
                            }
                            else {
                                angular.element('.model-chart').empty();
                            }
                        });
                };

                /**
                 * [dropClick 点击下拉框]
                 * @param  {[type]} event [description]
                 * @param  {[type]} id    [description]
                 * @return {[type]}       [description]
                 */
                scope.selectType = function (item) {
                    scope.modelFirst = $.trim(item.text);
                    scope.isModelItemSelected = 0;
                    scope.optionShowModel = false;
                    scope.groupId = item.id;
                    scope.getModulData();
                };

                /**
                 * [getModulDrop 获取模型组的数据]
                 * @return {[type]} [description]
                 */
                var getModulDrop = function () {
                    modelService.searchModelGroup({
                        modelGroupName: ''
                    })
                        .then(function (result) {
                            scope.modelGroup = result.value ? result.value[0].children || [] : [];
                            if (!scope.groupId) {
                                scope.groupId = result.value && result.value.length && result.value[0].children.length ? result.value[0].children[0].id : '';
                                scope.modelFirst = result.value && result.value.length && result.value[0].children.length ? result.value[0].children[0].text : '';
                            }

                            scope.getModulData();
                        });
                };

                // 监听
                scope.$on('modelState', function (event, data) {
                    scope.selectCenter = data.selectCenter;
                    scope.selectTime = data.selectTime;
                    scope.startTime = data.startTime; // 新增开始时间
                    scope.endTime = data.endTime; // 新增开始时间
                    scope.centerFlag = data.centerFlag;
                    getModulDrop();
                    scope.isModelItemSelected = 0;
                });

                // 点击页面其他地方关闭弹窗
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.model-group-index-type').length
                        && !angular.element(event.target).hasClass('picture-select-down')
                        && scope.optionShowModel) {
                        scope.optionShowModel = false;
                    }

                    scope.$apply();
                });
            }
        };
    }]);
});
