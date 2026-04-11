/**
 * 自定义专题-基础分析-呼叫量
 * @author
 * @time
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
    app.directive('callChart', [
        'ngDialog',
        '$timeout',
        'reportService',
        '$q', function (ngDialog, $timeout, reportService, $q) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'analysis/detail/call/call-chart.htm',
                transclude: true,
                scope: {
                    pathId: '=',
                    assignAuth: '@'
                },
                link: function (scope, element, attrs) {
                    var chart;
                    scope.axisShow = false;
                    // y下拉列表隐藏
                    scope.yOtionShow = false;
                    // 用于接受维度参数
                    scope.xSelectList = [];
                    scope.allShow = true;
                    scope.chartType = 'column';
                    // 默认X选项列
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

                    scope.xSelected = '按时';
                    scope.xSelectKey = 'hour';

                    // 处理结果数据为表格图表展示格式
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
                            innArray.push(Number(chartData[i].value));
                        }
                        seriesArray.push({data: innArray, name: data.value[0].text});
                        // 图表数据顏色
                        var yData = seriesArray;
                        for (var i = 0; i < yData.length; i++) {
                            yData[i].color = '#01AEAD';
                        }
                    };

                    // 渲染图表
                    var drawChart = function (data) {
                        dealdata(data);
                        chart = new Highcharts.Chart({
                            chart: {
                                type: scope.chartType,
                                renderTo: 'callChart',
                                backgroundColor: '#fff',
                                borderBottomRightRadius: '10px',
                                color: '#fff'
                            },
                            title: {
                                text: data.value.text
                            },
                            // 重复定义--去除
                            // legend: {
                            //    enabled: false,
                            //    itemStyle: {
                            //        fontFamily: 'Microsoft YaHei',
                            //        color: '#B2B2B2',
                            //        fontWeight: 'normal'
                            //    },
                            //    itemHoverStyle: {
                            //        color: '#B2B2B2'
                            //    }
                            // },
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
                                        if (scope.xSelectKey === 'brand' || scope.xSelectKey === 'voiceId' || scope.xSelectKey === 'taskId') {
                                            return this.value.length > 10 ? this.value.substring(0, 10) + '...' : this.value;
                                            // return xData;
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
                                useHTML: true,
                                hideDelay: 1
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
                                },
                                series: {
                                    animation: {
                                        duration: 700
                                    }
                                }
                            },
                            legend: {
                                backgroundColor: '#fff'
                            },
                            series: seriesArray
                        });
                    };

                    /*
                     * 柱状图/折线图切换
                     * @params type column|柱状图 || line 折线图
                     * */
                    scope.changeChartType = function (type) {
                        scope.chartType = type;
                        scope.getChartData();
                    };

                    /**
                     * [toogel 下拉框的显示隐藏]
                     * @return {[type]} [description]
                     */
                    scope.toggle = function (axis) {
                        if (axis == 'x') {
                            scope.axisShow = !scope.axisShow;
                        }
                        else {
                            scope.yOptionShow = !scope.yOptionShow;
                        }
                    };

                    // 点解窗口任意位置，关闭下拉列表
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
                     * [getChartData 获取图表数据]
                     * @return {[type]} [description]
                     */
                    scope.getChartData = function () {
                        // 传递选择的xy,请求图表数据，以及xy轴的选中项
                        var chartParams = {
                            xAxis: scope.xSelectKey,
                            mainAxis: scope.mainAxis,
                            order: scope.xSelectKey,
                            orderType: 'asc',
                            condition: [],
                            secondaryAxis: [],
                            pathID: scope.pathId
                        };
                        var $scope = scope;
                        while (angular.isUndefined($scope.timesRange)) {
                            $scope = $scope.$parent;
                        }
                        var params = {
                            startTime: $scope.timesRange.defaultStart,
                            endTime: $scope.timesRange.defaultEnd,
                            chartParams: JSON.stringify(chartParams)
                        };
                        scope.getLineColumnData(params).then(function (result) {
                            if (result.value && result.value.length) {
                                scope.allShow = true;
                                $timeout(function () {
                                    drawChart(result);
                                }, 500);

                                /*将svg转化为canvas*/
                                // setTimeout(function () {
                                //     var code = chart.getChartHTML();
                                //     var reg = /<svg\s*.*>\s*.*<\/svg>/;
                                //     code = code.match(reg);
                                //     canvg(document.getElementById('callCanvasChart'), code[0]);
                                //     //console.log(document.getElementById('callCanvasChart').toDataURL())
                                //     scope.$emit('baseCallChartSvg', {svgCode: document.getElementById('callCanvasChart').toDataURL()});
                                // }, 1500);
                                scope.mouseLeaveChart(1300);
                            }
                            else {
                                scope.allShow = false;
                                setTimeout(function () {
                                    scope.$emit('baseCallChartSvg', {
                                        svgCode: ''
                                    });
                                }, 1500);
                            }
                        });

                        // reportService.getLineColumData(params)
                        //    .then(function (result) {
                        //        if (result.value && result.value.length) {
                        //            scope.allShow = true;
                        //            $timeout(function () {
                        //                drawChart(result)
                        //            }, 500);
                        //        } else {
                        //            scope.allShow = false;
                        //        }
                        //        deferred.resolve(result)
                        //    });

                        // 获取初始值
                        scope.setParams();
                    };
                    scope.getLineColumnData = function (params) {
                        var deferred = $q.defer();

                        /*石勇 新增 增加默认传值*/
                        if (params.startTime.length < 11) {
                            params.startTime = params.startTime + ' 00:00:00';
                            params.endTime = params.endTime + ' 23:59:59';
                        }

                        // 
                        reportService.getLineColumData(params)
                            .then(function (result) {
                                deferred.resolve(result);
                            });
                        return deferred.promise;
                    };

                    // 给父级菜单赋值
                    scope.setParams = function () {
                        var pscope = scope;
                        while (angular.isUndefined(pscope.tabPaths)) {
                            pscope = pscope.$parent;
                        }
                        angular.forEach(pscope.tabPaths, function (item) {
                            if (item.pathId === scope.pathId) {
                                item.xDimension = scope.xSelectKey;
                                item.yDimension = scope.ySelectKey;
                                item.chartDimensions = scope.xSelectList;
                                item.isChart = scope.chartType === 'column' ? 0 : 1;
                                return;
                            }

                        });
                    };

                    // 获取父级菜单的值
                    scope.getParams = function () {
                        var pscope = scope;
                        while (angular.isUndefined(pscope.tabPaths)) {
                            pscope = pscope.$parent;
                        }
                        angular.forEach(pscope.tabPaths, function (item) {
                            if (item.pathId === scope.pathId) {
                                scope.xSelectKey = item.xDimension;
                                // 按时按日的后台参数有变化做特殊处理
                                if (scope.xSelectKey === 'dimHour') {
                                    scope.xSelectKey = 'hour';
                                }

                                if (scope.xSelectKey === 'dimDay') {
                                    scope.xSelectKey = 'day';
                                }

                                scope.ySelectKey = item.yDimension;
                                scope.xSelectList = item.chartDimensions;
                                scope.chartType = item.isChart ? 'line' : 'column';
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

                                return;
                            }

                        });
                    };

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

                    /*scope.getAxisDrop();
                     scope.getParams();*/

                    /*scope.$watch("pathId", function(newValue, oldVale){
                     if(newValue){
                     scope.getParams();
                     // // 初始X、Y化下拉列表
                     scope.getAxisDrop();
                     }
                     });*/

                    // 画图刷新
                    scope.$on('callChartRefresh', function () {
                        scope.getAxisDrop();
                    });

                    // 刷新
                    scope.$on('refreshChart', function (event, data) {
                        if (!data.pathId) {
                            return;
                        }

                        scope.pathId = data.pathId;

                        scope.getParams();
                        scope.getAxisDrop();
                    });
                    scope.getParams();
                    scope.getAxisDrop();
                    // 选择维度弹窗
                    scope.setDimension = function (tim) {
                        scope.tim = tim; // 此参数用于专题柱状图获取维度时候，剔除部分维度(searchdim参数增加：reportTypeFlag: 1)
                        ngDialog.open({
                            template: 'analysis/detail/dimension-libs-directive.htm',
                            controller: 'dimensionLibsCtrl',
                            scope: scope,
                            showClose: false,
                            closeByEscape: false,
                            closeByDocument: true,
                            disableAnimation: true,
                            className: 'ngdialog-theme-default ngdialog-theme-model-push'
                        }).closePromise.then(function (dialog) {
                            // 当弹出层关闭后，自动更新 维度对象
                            if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                                return;
                            }

                            scope.xSelectList = [];
                            angular.forEach(dialog.value.pushDim, function (value) {
                                scope.xSelectList.push({
                                    key: value.key,
                                    name: value.name
                                });
                            });
                            scope.setParams();
                        });
                    };
                    // scope.mouseLeaveChart = function (second) {
                    //     setTimeout(function () {
                    //         scope.$emit('baseCallChartSvg', {svgCode: element.find('svg')[0]});
                    //     }, second);
                    // }
                    scope.mouseLeaveChart = function (second) {
                        setTimeout(function () {
                            // console.log(chart.getSVG())
                            // var code = chart.getChartHTML();
                            // var reg = /<svg\s*.*>\s*.*<\/svg>/;
                            // code = code.match(reg);\
                            var code = '';
                            if (scope.allShow) {
                                code = chart.getSVG();
                            }

                            // canvg(document.getElementById('callCanvasChart'), code);
                            // console.log(document.getElementById('callCanvasChart').toDataURL())
                            // scope.$emit('baseCallChartSvg', {svgCode: document.getElementById('callCanvasChart').toDataURL()});
                            scope.$emit('baseCallChartSvg', {
                                svgCode: code
                            });
                        }, second);
                    };

                }
            };
        }]);
});
